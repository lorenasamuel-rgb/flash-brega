import { createAdminClient } from "./supabase/admin";
import { assignSongToParticipant, assignInitialMissionsForNewParticipant } from "./missions";
import { normalizeSong } from "./supabase/helpers";

export async function enrichParticipantsWithEmail<
  T extends { auth_user_id: string | null },
>(participants: T[]) {
  const admin = createAdminClient();

  return Promise.all(
    participants.map(async (participant) => {
      if (!participant.auth_user_id) {
        return { ...participant, email: null as string | null };
      }

      const { data, error } = await admin.auth.admin.getUserById(
        participant.auth_user_id,
      );

      if (error || !data.user) {
        return { ...participant, email: null as string | null };
      }

      return { ...participant, email: data.user.email ?? null };
    }),
  );
}

export async function createParticipantAsAdmin(input: {
  eventId: string;
  email: string;
  password: string;
  nickname: string;
  optInPublic: boolean;
}) {
  const admin = createAdminClient();
  const email = input.email.toLowerCase().trim();

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      throw new Error("Este email já está cadastrado.");
    }
    throw authError;
  }

  const authUserId = authData.user.id;

  const { data: participant, error: insertError } = await admin
    .from("participants")
    .insert({
      event_id: input.eventId,
      auth_user_id: authUserId,
      nickname: input.nickname.trim(),
      opt_in_public: input.optInPublic,
    })
    .select("id, nickname, auth_user_id, songs(title, artist)")
    .single();

  if (insertError) {
    await admin.auth.admin.deleteUser(authUserId);
    if (insertError.code === "23505") {
      throw new Error("Apelido já em uso neste evento.");
    }
    throw insertError;
  }

  await assignSongToParticipant(input.eventId, participant.id);
  await assignInitialMissionsForNewParticipant(input.eventId, participant.id);

  const { data: full } = await admin
    .from("participants")
    .select("id, nickname, auth_user_id, songs(title, artist)")
    .eq("id", participant.id)
    .single();

  const songs = normalizeSong(full?.songs);

  return {
    id: participant.id,
    nickname: full?.nickname ?? participant.nickname,
    email,
    song: songs,
  };
}

export async function deleteParticipantAsAdmin(participantId: string) {
  const admin = createAdminClient();

  const { data: participant, error } = await admin
    .from("participants")
    .select("id, auth_user_id, avatar_url, event_id")
    .eq("id", participantId)
    .single();

  if (error || !participant) {
    throw new Error("Participante não encontrado.");
  }

  if (participant.avatar_url) {
    const marker = "/photos/";
    const idx = participant.avatar_url.indexOf(marker);
    if (idx !== -1) {
      const path = participant.avatar_url.slice(idx + marker.length);
      await admin.storage.from("photos").remove([path]);
    }
  }

  const { error: deleteError } = await admin
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (deleteError) throw deleteError;

  if (participant.auth_user_id) {
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(
      participant.auth_user_id,
    );
    if (authDeleteError) throw authDeleteError;
  }

  return { ok: true };
}

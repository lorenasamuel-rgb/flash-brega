export type MissionStatus =
  | "pending"
  | "awaiting_song"
  | "song_confirmed"
  | "photo_pending"
  | "completed";

export interface Event {
  id: string;
  name: string;
  code: string;
  starts_at: string | null;
  ends_at: string | null;
  ranking_frozen: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
}

export interface Participant {
  id: string;
  event_id: string;
  nickname: string;
  song_id: string | null;
  avatar_url: string | null;
  opt_in_public: boolean;
  created_at: string;
  songs?: Song | null;
}

export interface Mission {
  id: string;
  event_id: string;
  hunter_id: string;
  target_id: string;
  status: MissionStatus;
  created_at: string;
  hunter?: Participant;
  target?: Participant;
  encounters?: Encounter | null;
}

export interface Encounter {
  id: string;
  mission_id: string;
  photo_url: string | null;
  caption: string | null;
  song_confirmed_at: string | null;
  photo_confirmed_at: string | null;
  hidden_from_live: boolean;
  created_at: string;
  missions?: Mission & {
    hunter?: Participant & { songs?: Song };
    target?: Participant & { songs?: Song };
  };
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  hunter_count: number;
  hunted_count: number;
}

export interface SessionParticipant {
  id: string;
  event_id: string;
  nickname: string;
  song_title: string;
  song_artist: string;
  opt_in_public: boolean;
  avatar_url: string | null;
  email?: string;
}

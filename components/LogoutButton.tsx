"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/e/BREGA2026";
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-purple-500 underline"
      type="button"
    >
      Sair
    </button>
  );
}

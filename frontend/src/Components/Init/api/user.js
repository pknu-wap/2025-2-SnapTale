export async function createUser(nickname) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
      nickname,
      rankPoint: 0,
      matchesPlayed: 0,
      wins: 0,
      lastSeen: new Date().toISOString()
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const user = data.result ?? data;
  localStorage.setItem("guestId", String(user.guestId));
  localStorage.setItem("nickname", user.nickname);
  return user;
}
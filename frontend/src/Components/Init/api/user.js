const API_BASE = import.meta.env.VITE_API_BASE;

async function parseJsonResponse(res) {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.result ?? data;
}

export async function getUser(guestId) {
  const res = await fetch(`${API_BASE}/api/users/${guestId}`);

  if (res.status == 404) {
    return null;
  }

  return parseJsonResponse(res);
}
export async function createUser(nickname) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nickname,
    }),
  });
  return parseJsonResponse(res);
}

export async function updateLastSeen(guestId) {
  const res = await fetch(`${API_BASE}/api/users/last-seen/${guestId}`, {
    method: "PATCH",
  });

  return parseJsonResponse(res);
}
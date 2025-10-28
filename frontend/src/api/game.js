const API_BASE = import.meta.env.VITE_API_BASE;

async function handleResponse(response) {
  if (!response.ok) {
    const message = `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "요청에 실패했습니다.");
  }

  return data.result;
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/users`, {
    credentials: "include",
  });

  return handleResponse(res);
}

export async function fetchDeckPresets() {
  const res = await fetch(`${API_BASE}/api/deck-presets`, {
    credentials: "include",
  });

  return handleResponse(res);
}

export async function initGame(payload) {
  const res = await fetch(`${API_BASE}/api/game/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function joinMatch(matchId, payload) {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function fetchCard(cardId) {
  const res = await fetch(`${API_BASE}/api/cards/${cardId}`, {
    credentials: "include",
  });

  return handleResponse(res);
}

export async function fetchCards(cardIds) {
  return Promise.all(cardIds.map((cardId) => fetchCard(cardId)));
}

export function buildWebSocketUrl(base = API_BASE) {
  const url = new URL(base);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws-stomp/websocket`;
}

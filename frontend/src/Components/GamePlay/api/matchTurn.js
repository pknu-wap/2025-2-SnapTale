// src/Components/GamePlay/api/match.js
const API_BASE = String(import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");

async function parseJsonOrThrow(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text || "(no body)"}`);

  const data = text ? JSON.parse(text) : {};
  return data.result ?? data;
}

export async function playAction(matchId, body) {
  const url = `${API_BASE}/api/matches/${matchId}/play-action`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJsonOrThrow(res);
}

export async function startNextTurn(matchId) {
  const url = `${API_BASE}/api/matches/${matchId}/turns/start`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
    },
  });
  return parseJsonOrThrow(res);
}
const API_BASE = import.meta.env.VITE_API_BASE;

async function parseJsonResponse(res) {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`잘못된 JSON 응답: ${text}`);
    }
  }

  if (!res.ok) {
    const message = data?.message ?? text ?? res.statusText;
    throw new Error(`HTTP ${res.status}: ${message}`);
  }

  return data?.result ?? data;
}

async function requestPlayAction(matchId, payload) {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/play-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function playCardAction({ matchId, participantId, cardId, slotIndex }) {
  const normalizedSlotIndex = Number.isFinite(slotIndex) ? slotIndex : 0;

  return requestPlayAction(matchId, {
    participantId,
    cardId,
    actionType: "PLAY_CARD",
    additionalData: JSON.stringify({ slotIndex: normalizedSlotIndex }),
  });
}

export async function endTurnAction({ matchId, participantId }) {
  return requestPlayAction(matchId, {
    participantId,
    actionType: "END_TURN",
    additionalData: null,
  });
}

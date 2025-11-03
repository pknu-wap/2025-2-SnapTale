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

export async function fetchMatchParticipants() {
  const res = await fetch(`${API_BASE}/api/match-participants`);
  return parseJsonResponse(res);
}

export async function fetchParticipantByMatchAndGuest(matchId, guestId) {
  const participants = await fetchMatchParticipants();
  const matchIdNumber = Number(matchId);
  const guestIdNumber = Number(guestId);

  return (
    participants?.find(
      (participant) =>
        Number(participant.matchId) === matchIdNumber &&
        Number(participant.guestId) === guestIdNumber
    ) ?? null
  );
}

const API_BASE = import.meta.env.VITE_API_BASE;

async function parseJsonResponse(res) {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.result ?? data;
}

// 매치 조회
export async function getMatch(matchId) { // 매치 삭제 후 404면 null 반환
  try {
    const res = await fetch(`${API_BASE}/api/matches/${matchId}`);
    return await parseJsonResponse(res);
  } catch {
    // 404 등 오류는 null로 처리하여 폴링 루프에서 안전하게 중단 가능
    return null;
  }
}

// 매치 참가 (userId, nickname만 전송)
// MatchJoinMessage: matchId (서버에서 설정), userId (필수), nickname (필수), sessionId (서버에서 생성)
export async function joinMatch(matchId, userId, nickname) {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      nickname
    }),
  });
  return parseJsonResponse(res);
}
// 매치 생성
// MatchCreateReq: status (필수), winnerId (선택), turnCount (필수), endedAt (선택)
// MatchStatus: QUEUED, MATCHED, PLAYING, ENDED
export async function createMatch(status = "QUEUED", turnCount = 0) {
  const res = await fetch(`${API_BASE}/api/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      turnCount,
      winnerId: null,
      endedAt: null
    }),
  });
  return parseJsonResponse(res);
}

// 매치 삭제
export async function deleteMatch(matchId) {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}`, {
    method: "DELETE",
  });
  // 삭제 응답은 result가 없을 수 있으므로 오류만 검사
  return parseJsonResponse(res).catch(() => null);
}
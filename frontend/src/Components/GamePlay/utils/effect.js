export function parseEffect(effectRaw) {
  if (!effectRaw) return null;

  if (typeof effectRaw === "string") {
    try {
      return JSON.parse(effectRaw);
    } catch (error) {
      console.warn("[parseEffect] JSON 파싱 실패", error, effectRaw);
      return null;
    }
  }

  if (Array.isArray(effectRaw) || typeof effectRaw === "object") {
    return effectRaw;
  }

  return null;
}

function normalizeEffects(effectRaw) {
  const parsed = parseEffect(effectRaw);
  if (!parsed) return [];

  return Array.isArray(parsed) ? parsed : [parsed];
}

export function getMoveEffects(card) {
  return normalizeEffects(card?.effect).filter(
    (eff) => eff && eff.action === "enable_move"
  );
}

export function canMoveCard(card) {
  return getMoveEffects(card).length > 0;
}

export function isMoveLimitedPerTurn(card) {
  return getMoveEffects(card).some((eff) => eff?.value === "per_turn");
}
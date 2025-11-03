import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchParticipantByMatchAndGuest } from "../api/matchParticipant";

const DEFAULT_ENERGY = 3;

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function useMatchParticipant(matchId, guestId, options = {}) {
  const defaultEnergy = options.defaultEnergy ?? DEFAULT_ENERGY;
  const normalizedMatchId = normalizeNumber(matchId);
  const normalizedGuestId = normalizeNumber(guestId);

  const [participant, setParticipant] = useState(null);
  const [energy, setEnergy] = useState(defaultEnergy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyParticipant = useCallback(
    (nextParticipant) => {
      setParticipant(nextParticipant);
      if (
        nextParticipant &&
        typeof nextParticipant.energy === "number" &&
        !Number.isNaN(nextParticipant.energy)
      ) {
        setEnergy(nextParticipant.energy);
      } else {
        setEnergy(defaultEnergy);
      }
    },
    [defaultEnergy]
  );

  const fetchCurrentParticipant = useCallback(async () => {
    if (!normalizedMatchId || !normalizedGuestId) {
      return null;
    }

    const result = await fetchParticipantByMatchAndGuest(
      normalizedMatchId,
      normalizedGuestId
    );

    return result ?? null;
  }, [normalizedMatchId, normalizedGuestId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextParticipant = await fetchCurrentParticipant();
      applyParticipant(nextParticipant);
      return nextParticipant;
    } catch (err) {
      applyParticipant(null);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyParticipant, fetchCurrentParticipant]);

  useEffect(() => {
    let cancelled = false;

    if (!normalizedMatchId || !normalizedGuestId) {
      applyParticipant(null);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    fetchCurrentParticipant()
      .then((nextParticipant) => {
        if (cancelled) return;
        applyParticipant(nextParticipant);
      })
      .catch((err) => {
        if (cancelled) return;
        applyParticipant(null);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyParticipant, fetchCurrentParticipant, normalizedMatchId, normalizedGuestId]);

  const participantId = participant?.matchParticipantId ?? null;
  const isReady = useMemo(() => Boolean(participantId), [participantId]);

  return {
    participant,
    participantId,
    energy,
    setEnergy,
    loading,
    error,
    isReady,
    refresh,
  };
}

export default useMatchParticipant;

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UserContext = createContext(null);

function normalizeStoredNumber(value) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function readInitialUser() {
    const storedGuestId = localStorage.getItem("guestId");
    const storedNickname = localStorage.getItem("nickname");
    const storedPoints = localStorage.getItem("points");
    const storedDeckId = localStorage.getItem("selectedDeckPresetId");
    
    const storedParticipantId = localStorage.getItem("participantId");
    const participantIdNumber = normalizeStoredNumber(storedParticipantId);

    const storedEnemyPlayer = localStorage.getItem("enemyPlayer"); //매치 끝나고 지워야 함
    let parsedEnemyPlayer = null;

    if (storedEnemyPlayer) {
        try {
            // JSON 문자열을 다시 객체로 변환
            parsedEnemyPlayer = JSON.parse(storedEnemyPlayer);
        } catch (e) {
                console.error("Failed to parse enemyPlayer from localStorage", e);
                parsedEnemyPlayer = null;
      }
    }

    if (!storedGuestId || !storedNickname) {
        return null;
    }

    const guestIdNumber = normalizeStoredNumber(storedGuestId);
    const pointsNumber = normalizeStoredNumber(storedPoints);
    const deckIdNumber = normalizeStoredNumber(storedDeckId);

  return {
    guestId: guestIdNumber ?? storedGuestId,
    nickname: storedNickname,
    points: pointsNumber,
    selectedDeckPresetId: deckIdNumber ?? null,
    participantId: participantIdNumber ?? null,
    enemyPlayer: parsedEnemyPlayer ?? null,
  };
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem("guestId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("points");
    localStorage.removeItem("selectedDeckPresetId");
    localStorage.removeItem("enemyPlayer");
    return;
  }

  localStorage.setItem("guestId", String(user.guestId));
  localStorage.setItem("nickname", user.nickname ?? "");

  if (typeof user.points === "number" && !Number.isNaN(user.points)) {
    localStorage.setItem("points", String(user.points));
  } else {
    localStorage.removeItem("points");
  }
  if (typeof user.selectedDeckPresetId === "number" && !Number.isNaN(user.selectedDeckPresetId)) {
    localStorage.setItem("selectedDeckPresetId", String(user.selectedDeckPresetId));
  } else {
    localStorage.removeItem("selectedDeckPresetId");
  }
  if (typeof user.participantId === "number" && !Number.isNaN(user.participantId)) {
    localStorage.setItem("participantId", String(user.participantId));
  } else {
    localStorage.removeItem("participantId");
  }
  if (user.enemyPlayer && typeof user.enemyPlayer === "object") {
    localStorage.setItem("enemyPlayer", JSON.stringify(user.enemyPlayer));
  } else {
    // null이거나 없으면 localStorage에서 제거
    localStorage.removeItem("enemyPlayer");
  }
}

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => readInitialUser());

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    persistUser(nextUser);
  }, []);

  const updateUser = useCallback((updates) => {
    setUserState((prev) => {
      if (!prev) {
        const next = updates ?? null;
        persistUser(next);
        return next;
      }

      const next = { ...prev, ...(updates ?? {}) };
      persistUser(next);
      return next;
    });
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    persistUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      clearUser,
    }),
    [user, setUser, updateUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
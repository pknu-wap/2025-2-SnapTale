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
  };
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem("guestId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("points");
    localStorage.removeItem("selectedDeckPresetId");
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
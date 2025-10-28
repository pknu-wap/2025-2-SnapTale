/* eslint-disable react-refresh/only-export-components */
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

    if (!storedGuestId || !storedNickname) {
        return null;
    }

    const guestIdNumber = normalizeStoredNumber(storedGuestId);
  const pointsNumber = normalizeStoredNumber(storedPoints);

  return {
    guestId: guestIdNumber ?? storedGuestId,
    nickname: storedNickname,
    points: pointsNumber,
  };
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem("guestId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("points");
    return;
  }

  localStorage.setItem("guestId", String(user.guestId));
  localStorage.setItem("nickname", user.nickname ?? "");

  if (typeof user.points === "number" && !Number.isNaN(user.points)) {
    localStorage.setItem("points", String(user.points));
  } else {
    localStorage.removeItem("points");
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

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
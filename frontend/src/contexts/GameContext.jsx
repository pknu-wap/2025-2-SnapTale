/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useReducer } from "react";

const GameContext = createContext(null);

const initialState = {
  matchId: null,
  participants: {},
  locations: [],
  participantScores: [],
  currentUserParticipantId: null,
  stompSessionId: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_INITIAL_STATE": {
      const { matchId, participants, locations, currentUserParticipantId } = action.payload;
      return {
        matchId,
        participants,
        locations: locations ?? [],
        participantScores: Object.values(participants).map((participant) => ({
          participantId: participant.participantId,
          nickname: participant.nickname,
          score: 0,
          remainingCards: participant.remainingCards ?? participant.handCardIds?.length ?? 0,
        })),
        currentUserParticipantId: currentUserParticipantId ?? null,
        stompSessionId: null,
      };
    }
    case "SET_PARTICIPANT_HAND": {
      const { participantId, handCards } = action.payload;
      if (!state.participants[participantId]) {
        return state;
      }
      return {
        ...state,
        participants: {
          ...state.participants,
          [participantId]: {
            ...state.participants[participantId],
            handCards,
          },
        },
      };
    }
    case "UPDATE_SCORES": {
      return {
        ...state,
        participantScores: action.payload ?? [],
      };
    }
    case "SET_STOMP_SESSION": {
      return {
        ...state,
        stompSessionId: action.payload ?? null,
      };
    }
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setInitialGameState = useCallback((payload) => {
    dispatch({ type: "SET_INITIAL_STATE", payload });
  }, []);

  const setParticipantHandCards = useCallback((participantId, handCards) => {
    dispatch({
      type: "SET_PARTICIPANT_HAND",
      payload: { participantId, handCards },
    });
  }, []);

  const updateParticipantScores = useCallback((scores) => {
    dispatch({ type: "UPDATE_SCORES", payload: scores });
  }, []);

  const setStompSessionId = useCallback((sessionId) => {
    dispatch({ type: "SET_STOMP_SESSION", payload: sessionId });
  }, []);

  const clearGame = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const value = useMemo(
    () => ({
      gameState: state,
      setInitialGameState,
      setParticipantHandCards,
      updateParticipantScores,
      setStompSessionId,
      clearGame,
    }),
    [state, setInitialGameState, setParticipantHandCards, updateParticipantScores, setStompSessionId, clearGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}

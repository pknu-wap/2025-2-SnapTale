import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/SoundIcon";
import { useUser } from "../../contexts/UserContext.jsx";
import { useGame } from "../../contexts/GameContext.jsx";
import { buildWebSocketUrl, fetchCards, joinMatch } from "../../api/game.js";
import { SimpleStompClient } from "../../lib/simpleStompClient.js";

const STATUS_LABEL = {
  connecting: "매치 서버에 연결 중...",
  connected: "상대와 연결되었습니다.",
  joining: "매치에 참가 중...",
  ready: "매치 준비 완료!",
  error: "연결에 실패했습니다.",
};

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams();
  const matchId = matchIdParam ? Number(matchIdParam) : null;
  const { user } = useUser();
  const {
    gameState,
    updateParticipantScores,
    setParticipantHandCards,
    setStompSessionId,
    clearGame,
  } = useGame();

  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState(null);

  const myParticipant = useMemo(() => {
    if (!gameState) return null;
    return gameState.participants?.[gameState.currentUserParticipantId] ?? null;
  }, [gameState]);

  useEffect(() => {
    return () => {
      clearGame();
    };
  }, [clearGame]);

  useEffect(() => {
    if (!matchId || !gameState || gameState.matchId !== matchId) {
      navigate("/home", { replace: true });
    }
  }, [gameState, matchId, navigate]);

  useEffect(() => {
    if (!gameState || !user || !matchId || gameState.matchId !== matchId) {
      return undefined;
    }

    let isCancelled = false;
    setConnectionStatus("connecting");
    setError(null);

    const client = new SimpleStompClient(buildWebSocketUrl());

    let subscription = null;

    client.onError((clientError) => {
      if (isCancelled) {
        return;
      }
      setError(clientError.message || "STOMP 연결 오류가 발생했습니다.");
      setConnectionStatus("error");
    });

    client.onClose(() => {
      if (isCancelled) {
        return;
      }
      setConnectionStatus((prev) => (prev === "error" ? prev : "connecting"));
    });

    client
      .connect()
      .then(async (frame) => {
        if (isCancelled) {
          return;
        }

        const sessionId = frame.headers.session;
        setStompSessionId(sessionId);
        setConnectionStatus("connected");

        subscription = client.subscribe(`/topic/match/${matchId}`, (messageFrame) => {
          try {
            const payload = JSON.parse(messageFrame.body);
            if (payload?.data?.participantScores) {
              updateParticipantScores(payload.data.participantScores);
            }
          } catch (subscribeError) {
            console.error("매치 업데이트 파싱 실패", subscribeError);
          }
        });

        try {
          setConnectionStatus("joining");
          const response = await joinMatch(matchId, {
            userId: user.guestId,
            nickname: user.nickname,
            sessionId,
          });

          if (response?.gameState?.participantScores) {
            updateParticipantScores(response.gameState.participantScores);
          }
          setConnectionStatus("ready");
        } catch (joinError) {
          console.error(joinError);
          setError(joinError.message || "매치 참가 중 오류가 발생했습니다.");
          setConnectionStatus("error");
        }
      })
      .catch((connectError) => {
        if (isCancelled) {
          return;
        }
        setError(connectError.message || "STOMP 연결에 실패했습니다.");
        setConnectionStatus("error");
      });

    return () => {
      isCancelled = true;
      if (subscription) {
        subscription.unsubscribe();
      }
      client.disconnect();
    };
  }, [gameState, matchId, setStompSessionId, updateParticipantScores, user]);

  useEffect(() => {
    if (!myParticipant || !myParticipant.handCardIds?.length || myParticipant.handCards) {
      return undefined;
    }

    let cancelled = false;

    async function loadHandCards() {
      try {
        const cards = await fetchCards(myParticipant.handCardIds);
        if (!cancelled) {
          setParticipantHandCards(myParticipant.participantId, cards);
        }
      } catch (fetchError) {
        console.error(fetchError);
      }
    }

    loadHandCards();

    return () => {
      cancelled = true;
    };
  }, [myParticipant, setParticipantHandCards]);

  const statusMessage = STATUS_LABEL[connectionStatus] ?? STATUS_LABEL.connecting;

  if (!matchId || !gameState || gameState.matchId !== matchId) {
    return null;
  }

  return (
    <div className="gameplay-container">
      <header className="gameplay-header">
        <Soundbar />
        <div className="connection-status">
          <span>{statusMessage}</span>
          {error && <span className="connection-error">{error}</span>}
        </div>
        <button
          className="exit-btn"
          onClick={() => {
            clearGame();
            navigate("/home");
          }}
        >
          나가기
        </button>
      </header>
      <GameLayout />
    </div>
  );
};

export default GamePlay;
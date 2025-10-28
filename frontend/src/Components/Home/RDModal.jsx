import "./Modal.css";
import MatchCode from "./MatchCode";
import profile1 from "../../assets/userProfile.png";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext.jsx";
import { useGame } from "../../contexts/GameContext.jsx";
import { fetchDeckPresets, fetchUsers, initGame } from "../../api/game.js";

const STATUS = {
  IDLE: "idle",
  MATCHING: "matching",
  READY: "ready",
  ERROR: "error",
};

const RDModal = ({ setOpenRDModal, matchCode }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { setInitialGameState, clearGame } = useGame();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [enemyPlayer, setEnemyPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const statusLabel = useMemo(() => {
    switch (status) {
      case STATUS.MATCHING:
        return "상대를 찾는 중입니다...";
      case STATUS.READY:
        return "매칭 완료!";
      case STATUS.ERROR:
        return error ?? "매칭 중 문제가 발생했습니다.";
      default:
        return "전투 준비 중...";
    }
  }, [status, error]);

  useEffect(() => {
    if (!user) {
      setStatus(STATUS.ERROR);
      setError("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    let isCancelled = false;

    async function startMatching() {
      try {
        setStatus(STATUS.MATCHING);

        const [users, deckPresets] = await Promise.all([
          fetchUsers(),
          fetchDeckPresets(),
        ]);

        if (isCancelled) {
          return;
        }

        const candidates = users.filter((candidate) => candidate.guestId !== user.guestId);

        if (candidates.length === 0) {
          throw new Error("매칭 가능한 상대를 찾지 못했습니다.");
        }

        const opponent = candidates[Math.floor(Math.random() * candidates.length)];
        setEnemyPlayer({
          userName: opponent.nickname,
          profileImage: profile1,
          guestId: opponent.guestId,
        });

        const activeDecks = deckPresets
          .filter((deck) => deck.active !== 0 && deck.cards?.length)
          .map((deck) => deck.deckPresetId);

        if (activeDecks.length < 2) {
          throw new Error("사용 가능한 덱이 부족합니다.");
        }

        const shuffledDecks = [...activeDecks].sort(() => Math.random() - 0.5);
        const [deck1Id, deck2Id] = [shuffledDecks[0], shuffledDecks.find((deckId) => deckId !== shuffledDecks[0])];

        if (!deck1Id || !deck2Id) {
          throw new Error("두 플레이어에게 배정할 덱을 찾을 수 없습니다.");
        }

        const initResult = await initGame({
          player1Id: user.guestId,
          player2Id: opponent.guestId,
          deck1Id,
          deck2Id,
        });

        if (isCancelled) {
          return;
        }

        setInitialGameState({
          matchId: initResult.matchId,
          locations: initResult.locationIds,
          currentUserParticipantId: initResult.participant1Id,
          participants: {
            [initResult.participant1Id]: {
              participantId: initResult.participant1Id,
              userId: user.guestId,
              nickname: user.nickname,
              deckId: deck1Id,
              handCardIds: initResult.player1HandCardIds,
            },
            [initResult.participant2Id]: {
              participantId: initResult.participant2Id,
              userId: opponent.guestId,
              nickname: opponent.nickname,
              deckId: deck2Id,
              handCardIds: initResult.player2HandCardIds,
            },
          },
        });

        setStatus(STATUS.READY);
        setOpenRDModal(false);
        navigate(`/gameplay/${initResult.matchId}`);
      } catch (err) {
        if (isCancelled) {
          return;
        }
        setError(err.message || "매칭에 실패했습니다.");
        setStatus(STATUS.ERROR);
      }
    }

    startMatching();

    return () => {
      isCancelled = true;
    };
  }, [navigate, retryToken, setInitialGameState, setOpenRDModal, user]);

  return (
    <div className="Overlay">
      <button
        className="cancelIcon"
        onClick={() => {
          clearGame();
          setOpenRDModal(false);
        }}
        aria-label="매칭 취소"
      />
      <div className="modal-main">
        {matchCode && <MatchCode matchCode={matchCode} />}
        <span className="modal-text">{statusLabel}</span>
        {enemyPlayer && status !== STATUS.ERROR && (
          <div className="matched-player">
            <img src={enemyPlayer.profileImage} alt="상대 프로필" className="matched-player-avatar" />
            <span className="matched-player-name">{enemyPlayer.userName}</span>
          </div>
        )}
        {status === STATUS.ERROR && (
          <button
            className="retry-button"
            onClick={() => {
              setStatus(STATUS.IDLE);
              setError(null);
              setEnemyPlayer(null);
              setRetryToken((prev) => prev + 1);
            }}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

export default RDModal;
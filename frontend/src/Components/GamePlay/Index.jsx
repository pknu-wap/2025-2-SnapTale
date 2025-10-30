import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/SoundIcon";
import UserProfile from "../Home/UserProfile";
import MatchLoadingOverlay from "../Home/GameLoading";
import MatchChatPanel from "./MatchChatPanel";
import { useUser } from "../../contexts/UserContext";
import { getMatch } from "../Home/api/match";
import { fetchDeckPreset, fetchDeckPresetCards } from "./api/deck";
import useMatchSocket from "./hooks/useMatchSocket";
import defaultProfileImage from "../../assets/userProfile.png";
import "./GameLayout.css";

const DECK_POOL = [1, 2, 3];

const buildChatId = (chat) => `${chat.sentAt ?? Date.now()}-${Math.random().toString(36).slice(2)}`;

const GamePlay = () => {
  const { matchId: matchIdParam } = useParams();
  const numericMatchId = Number(matchIdParam);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state ?? {};
  const { user } = useUser();

  const defaultSelf = useMemo(
    () => ({
      nickname: user?.nickname ?? "나",
      profileImage: locationState.self?.profileImage ?? defaultProfileImage,
    }),
    [locationState.self?.profileImage, user?.nickname]
  );

  const defaultOpponent = useMemo(
    () => ({
      nickname: locationState.opponent?.nickname ?? "상대방",
      profileImage: locationState.opponent?.profileImage ?? defaultProfileImage,
    }),
    [locationState.opponent?.nickname, locationState.opponent?.profileImage]
  );

  const [players, setPlayers] = useState(() => ({
    self: locationState.self ?? defaultSelf,
    opponent: locationState.opponent ?? defaultOpponent,
  }));
  const [matchInfo, setMatchInfo] = useState(null);
  const [deckName, setDeckName] = useState("");
  const [handCards, setHandCards] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [loadingDeck, setLoadingDeck] = useState(true);
  const [statusMessage, setStatusMessage] = useState("매치 정보를 불러오는 중...");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (!matchIdParam || Number.isNaN(numericMatchId)) {
      navigate("/home", { replace: true });
    }
  }, [matchIdParam, numericMatchId, navigate]);

  useEffect(() => {
    setPlayers((prev) => ({
      self: prev.self ?? defaultSelf,
      opponent: prev.opponent ?? defaultOpponent,
    }));
  }, [defaultSelf, defaultOpponent]);

  const syncParticipants = useCallback((participants = []) => {
    setPlayers((prev) => {
      const selfParticipant = user ? participants.find((p) => p.guestId === user.guestId) : null;
      const opponentParticipant = participants.find((p) => !selfParticipant || p.guestId !== selfParticipant.guestId);

      const nextSelf = selfParticipant
        ? {
            ...(prev.self ?? defaultSelf),
            nickname: selfParticipant.nickname ?? prev.self?.nickname ?? defaultSelf.nickname,
          }
        : prev.self ?? defaultSelf;

      const nextOpponent = opponentParticipant
        ? {
            ...(prev.opponent ?? defaultOpponent),
            nickname: opponentParticipant.nickname ?? prev.opponent?.nickname ?? defaultOpponent.nickname,
          }
        : prev.opponent ?? defaultOpponent;

      return { self: nextSelf, opponent: nextOpponent };
    });
  }, [defaultOpponent, defaultSelf, user]);

  useEffect(() => {
    if (!matchIdParam) {
      return undefined;
    }

    let cancelled = false;

    const loadMatch = async () => {
      try {
        setLoadingMatch(true);
        setStatusMessage("매치 정보를 불러오는 중...");
        const data = await getMatch(matchIdParam);
        if (cancelled) return;

        if (!data) {
          setStatusMessage("매치를 찾을 수 없습니다.");
          setTimeout(() => navigate("/home", { replace: true }), 2000);
          return;
        }

        setMatchInfo(data);
        syncParticipants(data.participants);
      } catch (error) {
        if (!cancelled) {
          console.error("매치 정보 조회 실패", error);
          setStatusMessage("매치 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMatch(false);
        }
      }
    };

    loadMatch();

    return () => {
      cancelled = true;
    };
  }, [matchIdParam, navigate, syncParticipants]);

  useEffect(() => {
    if (!matchIdParam) {
      return undefined;
    }

    let cancelled = false;

    const loadDeck = async () => {
      try {
        setLoadingDeck(true);
        setStatusMessage("덱을 불러오는 중...");
        const deckPresetId = DECK_POOL[Math.floor(Math.random() * DECK_POOL.length)];
        const deckPreset = await fetchDeckPreset(deckPresetId);
        if (cancelled) return;

        setDeckName(deckPreset.name ?? `덱 ${deckPresetId}`);
        const cards = await fetchDeckPresetCards(deckPresetId);
        if (cancelled) return;

        setHandCards(cards);
      } catch (error) {
        if (!cancelled) {
          console.error("덱 로딩 실패", error);
          setDeckName("덱을 불러오지 못했습니다");
          setHandCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDeck(false);
        }
      }
    };

    loadDeck();

    return () => {
      cancelled = true;
    };
  }, [matchIdParam]);

  const handleSocketMessage = useCallback((payload) => {
    if (!payload) {
      return;
    }

    if (payload.success === false) {
      setSocketError(payload.message ?? "알 수 없는 오류가 발생했습니다.");
      return;
    }

    const wsMessage = payload.data;
    if (!wsMessage) {
      return;
    }

    if (wsMessage.type === "CHAT") {
      const chat = wsMessage.data;
      if (!chat) {
        return;
      }

      const chatItem = {
        id: buildChatId(chat),
        senderId: chat.senderId,
        senderNickname: chat.senderNickname ?? "익명",
        content: chat.content ?? "",
        sentAt: chat.sentAt,
      };

      setChatMessages((prev) => [...prev.slice(-49), chatItem]);
      return;
    }

    if (wsMessage.type === "JOIN" || wsMessage.type === "LEAVE") {
      getMatch(matchIdParam)
        .then((latest) => {
          if (latest) {
            setMatchInfo(latest);
            syncParticipants(latest.participants);
          }
        })
        .catch((error) => console.error("매치 참가자 동기화 실패", error));
    }

    if (wsMessage.data && typeof wsMessage.data === "object" && "currentRound" in wsMessage.data) {
      setMatchInfo((prev) => ({
        ...(prev ?? {}),
        currentRound: wsMessage.data.currentRound,
      }));
    }
  }, [matchIdParam, syncParticipants]);

  const { connected, error: wsError, send } = useMatchSocket(matchIdParam, {
    onMessage: handleSocketMessage,
    onConnect: () => setSocketError(null),
    onDisconnect: () => setSocketError("연결이 종료되었습니다."),
  });

  useEffect(() => {
    if (wsError) {
      setSocketError(wsError);
    }
  }, [wsError]);

  const handleSendChat = useCallback(() => {
    const trimmed = chatDraft.trim();
    if (!trimmed || !matchIdParam) {
      return;
    }

    try {
      send(`/app/match/${matchIdParam}/chat`, {
        senderId: user?.guestId ?? null,
        senderNickname: user?.nickname ?? "익명",
        content: trimmed,
      });
      setChatDraft("");
    } catch (error) {
      console.error("채팅 전송 실패", error);
      setSocketError(error.message);
    }
  }, [chatDraft, matchIdParam, send, user?.guestId, user?.nickname]);

  const overlayOpen = loadingMatch || loadingDeck;
  const round = matchInfo?.currentRound ?? matchInfo?.turnCount ?? 1;

  return (
    <div className="gameplay-container">
      <MatchLoadingOverlay
        open={overlayOpen}
        primaryText="전투 준비 중..."
        secondaryText={statusMessage}
      />
      <header className="gameplay-header">
        <Soundbar />
        <button
          className="exit-btn"
          type="button"
          onClick={() => navigate("/home")}
        >
          나가기
        </button>
      </header>

      <div className="match-banner">
        <div className="match-player">
          <UserProfile
            userName={players.self?.nickname ?? defaultSelf.nickname}
            profileImage={players.self?.profileImage ?? defaultSelf.profileImage}
          />
        </div>
        <span className="match-vs">VS</span>
        <div className="match-player">
          <UserProfile
            userName={players.opponent?.nickname ?? defaultOpponent.nickname}
            profileImage={players.opponent?.profileImage ?? defaultOpponent.profileImage}
          />
        </div>
      </div>

      {deckName && (
        <div className="match-deck-info">사용 덱: {deckName}</div>
      )}

      <GameLayout
        cards={handCards}
        opponentNickname={players.opponent?.nickname ?? defaultOpponent.nickname}
        currentRound={round}
      />

      <MatchChatPanel
        isOpen={chatOpen}
        onToggle={() => setChatOpen((prev) => !prev)}
        messages={chatMessages}
        draft={chatDraft}
        onDraftChange={setChatDraft}
        onSend={handleSendChat}
        disabled={!connected}
        connected={connected}
        error={socketError}
      />
    </div>
  );
};

export default GamePlay;
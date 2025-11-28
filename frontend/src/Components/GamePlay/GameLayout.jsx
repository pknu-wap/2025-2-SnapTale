// src/Components/GamePlay/GameLayout.jsx
import { useState, useEffect, useMemo, useCallback} from "react";
import { useUser } from "../../contexts/UserContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNavigate } from "react-router-dom";
import "./GameLayout.css";
import "./GameLayoutMobile.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import Slot from "./Slot";
import EnlargedCard from "./EnlargedCard";
import EnlargedLocation from "./EnlargedLocation";
import CustomDragLayer from "./CustomDragLayer";
import defaultImg from "../../assets/koreaIcon.png";
import GameChatFloatingButton from "./GameChatFloatingButton";
import GameEndModal from "./GameEndModal";
import { getMatch, verifyParticipant } from "../Home/api/match";
import { fetchLocationsByMatchId } from "./api/location";
import { playAction } from "./api/matchTurn";
import useMatchWebSocket from "./GameLayout/hooks/useMatchWebSocket";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { canMoveCard, isMoveLimitedPerTurn } from "./utils/effect";

const TURN_TIMEOUT_MS = 60 * 1000;
const TURN_SHAKE_THRESHOLD_MS = 3000;

export default function GameLayout({ matchId }) {
  const maxTurn = 6;
  const navigate = useNavigate();

  const { user, updateUser } = useUser();
  const [selectedCardId, setSelectedCardId] = useState(null); // 첫 번째 클릭 -> 카드 ID 저장
  const [selectedCard, setSelectedCard] = useState(null); //두 번째 클릭 -> 카드 오버레이 표시
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opponentPowers, setOpponentPowers] = useState([0, 0, 0]);
  const [myPowers, setMyPowers] = useState([0, 0, 0]);
  const [turn, setTurn] = useState(1);
  const [hand, setHand] = useState([]);
  const [boardLanes, setBoardLanes] = useState([
    [null, null, null, null], // SLOT_COUNT 0
    [null, null, null, null], // SLOT_COUNT 1
    [null, null, null, null], // SLOT_COUNT 2
  ]);
  const [opponentBoardLanes, setOpponentBoardLanes] = useState([
    [], // 상대 지역 0의 카드들
    [], // 상대 지역 1의 카드들
    [], // 상대 지역 2의 카드들
  ]);
  // eslint-disable-next-line no-unused-vars
  const [cardPlayed, setCardPlayed] = useState(false); // 카드 플레이 여부 (향후 턴 종료 로직에서 사용 예정)
  const [energy, setEnergy] = useState(3);
  const [allCards, setAllCards] = useState([]);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [gameEndModalState, setGameEndModalState] = useState({
    isOpen: false,
    detail: "",
  });
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [isReviewingBoard, setIsReviewingBoard] = useState(false);
  const [movedThisTurn, setMovedThisTurn] = useState({});
  const [turnTimerDeadline, setTurnTimerDeadline] = useState(null);
  const [turnTimerProgress, setTurnTimerProgress] = useState(0);
  const [turnTimerRemainingMs, setTurnTimerRemainingMs] = useState(0);
  const { subscribe } = useWebSocket();
  const isInteractionLocked = isGameEnded;
  const handleCardClick = (card, e) => {
  if (isInteractionLocked) return;
    // 버블링 방지 (외부 클릭 감지와 충돌 방지)
    e.stopPropagation();

    if (selectedCardId === card.cardId) {
      setSelectedCard(card);  // 오버레이 띄우기
      setSelectedCardId(null); // 선택 해제
    } else {
      setSelectedCardId(card.cardId);
    }
  };
  useEffect( () => { 
    const clearSelection = () => setSelectedCardId(null); 
    document.addEventListener("click", clearSelection); //빈 공간 클릭 시 선택 해제
    return () => document.removeEventListener("click", clearSelection); //종료될 때 정리
    }, []
  );

  const opponentName = useMemo(() => {
    if (!user?.enemyPlayer) {
      return "상대방";
    }

    return (
      user.enemyPlayer.nickname ||
      user.enemyPlayer.userName ||
      user.enemyPlayer.name ||
      "상대방"
    );
  }, [user?.enemyPlayer]);

  const myNickname = user?.nickname ?? "나";

  // 매치 정보 및 에너지 로드
  useEffect(() => {
    async function loadMatchData() {
      if (!matchId || !user?.guestId) return;

      try {
        const match = await getMatch(matchId);
        const me = match?.participants?.find(p => p.guestId === user.guestId);
        
        if (me) {
          // participantId 설정
          if (me.participantId && !user.participantId) {
            updateUser({ participantId: me.participantId });
          }
          
          // 에너지 설정 (항상 최신 값으로 업데이트)
          if (me.energy !== undefined && me.energy !== null) {
            setEnergy(me.energy);
            console.log("에너지 로드: energy=", me.energy);
          }
        }
      } catch (e) {
        console.warn("매치 정보 조회 실패:", e);
      }
    }
    loadMatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, user?.guestId]);
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // 선택한 덱의 카드들을 불러와 hand와 allCards 구성
  useEffect(() => {
    async function loadDeckCards() {
      if (!user?.selectedDeckPresetId) return;
      try {
        const resDeck = await fetch(`${import.meta.env.VITE_API_BASE}/api/deck-presets/${user.selectedDeckPresetId}`);
        if (!resDeck.ok) throw new Error(`Failed to load deck preset: ${resDeck.status}`);
        const deckData = await resDeck.json();
        const deck = deckData.result ?? deckData; //cardId는 중복없이 12장 받고 있는 중
        //중복 없이 12장을 받는지 검증하는 로직은 없음
        const cardIds = (deck.cards ?? []).map(c => c.cardId);

        const cardPromises = cardIds.map(cardId =>
          fetch(`${import.meta.env.VITE_API_BASE}/api/cards/${cardId}`)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(d => d.result ?? d)
        );
        const cards = await Promise.all(cardPromises);

        const mapped = cards.map(item => ({
          cardId: item.cardId,
          name: item.name,
          imageUrl: item.imageUrl || defaultImg,
          cost: item.cost,
          power: item.power,
          faction: item.faction,
          effectDesc: item.effectDesc,
          effect: item.effect || null, // effect 필드 추가
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        // 덱 셔플링 
        const shuffledDeck = shuffleArray([...mapped]); // 12장 섞기
        //이제 매 플레이마다 새로운 카드들이 기본 패로 등장합니다.

        // 손패와 덱 분리
        const initialHand = shuffledDeck.slice(0, 3);   // 섞인 덱의 0~2번 (3장)
        const remainingDeck = shuffledDeck.slice(3); // 섞인 덱의 3번부터 끝까지 (9장)

        // 분리된 상태로 저장
        setHand(initialHand);
        setAllCards(remainingDeck); // 12장이 아닌, 손패를 제외한 9장이 덱에 저장됨
      } catch (e) {
        console.error("덱 카드 불러오기 실패:", e);
      }
    }
    loadDeckCards();
  }, [user?.selectedDeckPresetId]);

  // 참가자 검증
  useEffect(() => {
    async function checkParticipant() {
      if (!matchId || !user?.guestId) {
        alert("잘못된 접근입니다. 메인 화면으로 돌아갑니다.");
        navigate("/home");
        return;
      }

      try {
        const isParticipant = await verifyParticipant(matchId, user.guestId);
        
        if (!isParticipant) {
          alert("접근 권한이 없습니다. 메인 화면으로 돌아갑니다.");
          navigate("/home");
        }
      } catch (error) {
        console.error("참가자 검증 중 오류:", error);
        alert("접근 권한 확인에 실패했습니다. 메인 화면으로 돌아갑니다.");
        navigate("/home");
      }
    }

    checkParticipant();
  }, [matchId, user?.guestId, navigate]);

  useEffect(() => {
    async function loadLocations() {
      if (!matchId) {
        setError("매치 ID가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchLocationsByMatchId(matchId);
        if (data.success && Array.isArray(data.result)) {
          console.log("서버에서 받은 매치 지역 데이터:", data.result);
          console.log("서버에서 받은 매치 지역 개수:", data.result.length);
          console.log("유저 아이디:", user.participantId);
          const formatted = data.result.map((item) => ({
            locationId: item.location.locationId,
            name: item.location.name,
            imageUrl: item.location.imageUrl || defaultImg,
            effectDesc: item.location.effectDesc,
            isActive: item.location.isActive,
            revealedTurn: item.revealedTurn,
            matchId: item.matchId,
            slotIndex: item.slotIndex,
          }));
          const sorted = formatted.sort((a, b) => a.slotIndex - b.slotIndex);
          console.log("매치 지역 ID:", sorted.map(loc => loc.locationId).join(", "));
          setLocations(sorted);
        } else {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }
      } catch (err) {
        console.error("위치 정보 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, [matchId, user?.participantId]);

  
  const restartTurnTimer = useCallback(() => {
    setTurnTimerDeadline(Date.now() + TURN_TIMEOUT_MS);
    setTurnTimerProgress(0);
    setTurnTimerRemainingMs(TURN_TIMEOUT_MS);
  }, []);

  const stopTurnTimer = useCallback(() => {
    setTurnTimerDeadline(null);
    setTurnTimerProgress(0);
    setTurnTimerRemainingMs(0);
  }, []);

  const completeTurnTimer = useCallback(() => {
    setTurnTimerProgress(1);
    setTurnTimerDeadline(null);
    setTurnTimerRemainingMs(0);
  }, []);

  useEffect(() => {
    // 게임이 처음 로드되고, 첫 턴이며, 대기중이 아니고, 타이머가 없으면 시작
    if (turn === 1 && !isWaitingForOpponent && !isGameEnded && !turnTimerDeadline) {
      console.log("🎮 게임 초기화: 첫 턴 타이머 시작");
      restartTurnTimer();
    }
  }, [turn, isWaitingForOpponent, isGameEnded, turnTimerDeadline, restartTurnTimer]);

  useEffect(() => {
    if (!turnTimerDeadline || isWaitingForOpponent || isGameEnded) {
      return undefined;
    }

    const updateProgress = () => {
      const remaining = Math.max(turnTimerDeadline - Date.now(), 0);
      setTurnTimerRemainingMs(remaining);
      const progress = 1 - remaining / TURN_TIMEOUT_MS;
      setTurnTimerProgress(Math.min(1, Math.max(0, progress)));
      if (remaining <= 0) {
        setTurnTimerDeadline(null);
      }
    };

    updateProgress();
    const intervalId = setInterval(updateProgress, 100);
    return () => clearInterval(intervalId);
  }, [turnTimerDeadline, isWaitingForOpponent, isGameEnded]);

  useEffect(() => {
    if (isWaitingForOpponent || isGameEnded) {
      stopTurnTimer();
    }
  }, [isWaitingForOpponent, isGameEnded, stopTurnTimer]);

  useMatchWebSocket({
    matchId,
    user,
    subscribe,
    setIsWaitingForOpponent,
    setTurn,
    setEnergy,
    setMyPowers,
    setOpponentPowers,
    setOpponentBoardLanes,
    setBoardLanes,
    setGameEndModalState,
    setIsGameEnded,
    setIsReviewingBoard,
    onTurnTimerRestart: restartTurnTimer,
    onTurnTimerStop: stopTurnTimer,
    onTurnTimeout: completeTurnTimer,
  });

  useEffect(() => {
    setIsWaitingForOpponent(false);
    setIsGameEnded(false);
    setIsReviewingBoard(false);
    setGameEndModalState({ isOpen: false, detail: ""});
  }, [matchId]);

  useEffect(() => {
    setMovedThisTurn({});
  }, [turn]);

  const endTurnButtonLabel = useMemo(() => {
    if (isWaitingForOpponent) { 
      return { line1: "상대의 턴을", line2: "기다리는 중...", };
    }
    return { line1: "턴 종료", line2: `(${turn} / ${maxTurn})` };
  }, [isWaitingForOpponent, turn, maxTurn]);

  const isTurnTimerVisible = Boolean(
    turnTimerDeadline && !isWaitingForOpponent && !isGameEnded
  );
  const secondsLeft = Math.max(0, Math.ceil(turnTimerRemainingMs / 1000));
  const shouldShowCountdown = isTurnTimerVisible && secondsLeft > 0 && secondsLeft <= 3;
  const shouldShakeButton =
    shouldShowCountdown && turnTimerRemainingMs <= TURN_SHAKE_THRESHOLD_MS;
  const turnTimerFillPercent = isTurnTimerVisible
    ? Math.min(100, Math.max(turnTimerProgress, 0.05) * 100)
    : 0;
  console.log("isTurnTimerVisible: %s, turnTimerDeadline: %s, isWaitingForOpponent: %s, isGameEnded: %s"
    , isTurnTimerVisible, turnTimerDeadline, isWaitingForOpponent, isGameEnded);

  // const handleCardClick = (cardData) => {
  //   setSelectedCard(cardData);
  // };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const endTurn = async () => {
    if (isInteractionLocked) return;
    if (turn <= maxTurn) { // 6턴도 종료 가능하도록 변경
      try {
        // 서버에 턴 종료 요청
        const response = await playAction(matchId, {
          participantId: user.guestId,
          actionType: "END_TURN",
          additionalData: null,
        });

        console.log("턴 종료 응답:", response);
        
        // 에너지 업데이트
        if (response.energy !== undefined) {
          setEnergy(response.energy);
          console.log("턴 종료 후 에너지 업데이트: energy=", response.energy);
        }

        const normalizePowers = (source) =>
          Array.isArray(source) ? source.map((value) => Number(value) || 0) : null;

        const myLocationPowers = normalizePowers(response?.myLocationPowers);
        if (myLocationPowers) {
          setMyPowers(myLocationPowers);
        }

        setCardPlayed(false); // 다시 비활성화

        // 6턴이 끝나면 게임이 종료되므로 카드 드로우하지 않음
        if (turn < maxTurn && allCards.length > 0) {
          // 덱의 맨 위 카드(0번 인덱스)를 뽑을 카드로 지정합니다.
          const cardToDraw = allCards[0];

          // 덱에서 뽑힌 카드를 제외한 나머지 덱을 준비합니다.
          const newDeck = allCards.slice(1);

          // 손패(hand) 상태를 업데이트: 기존 손패에 뽑은 카드를 추가합니다.
          setHand((prevHand) => [...prevHand, cardToDraw]);

          // 덱(allCards) 상태를 업데이트: 카드가 제거된 새 덱으로 교체합니다.
          setAllCards(newDeck);
        }
      } catch (error) {
        console.error("턴 종료 실패:", error);
        alert(`턴 종료에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
      }
    }
  };

  const SLOT_COUNT = 3;

  const handleLocationClick = (locationData, index) => {
    if (isInteractionLocked) return;
    // locationData에 myPower, opponentPower가 없다면,
    // GameLayout의 state에서 가져와 합쳐줍니다.
    const locationWithPowers = {
      ...locationData,
      opponentPower: opponentPowers[index],
      myPower: myPowers[index],
    };
    setSelectedLocation(locationWithPowers);
  };

  const handleCloseLocationModal = () => {
    setSelectedLocation(null);
  };

  const handleConfirmGameEnd = () => {
    setGameEndModalState({ isOpen: false, detail: "" });
    setIsGameEnded(false);
    setIsReviewingBoard(false);
    navigate("/home");
  };

  const handleViewFinalBoard = () => {
    setGameEndModalState((prev) => ({ ...prev, isOpen: false }));
    setIsReviewingBoard(true);
  };
  
  const handleCardDrop = async ({ 
    card,
    laneIndex,
    fromLaneIndex,
    fromSlotIndex,
    origin,
    fromLocationId,
    toLocationId,
   }) => {
    // main 브랜치에서 온 가드 로직 유지
    // 대기/종료 상태에서는 드래그 투하도 막는다.
    if (isInteractionLocked || isWaitingForOpponent) {
      return;
    }

    if (!card || !card.cardId) {
      console.warn("[GameLayout] Slot에서 유효하지 않은 카드 데이터를 받았습니다.", { card, laneIndex });
      return;
    }

    // participantId가 없으면 요청 불가
    if (!user?.participantId) {
      console.warn("participantId 없음 → play-action 전송 스킵");
      alert("참가자 정보가 없습니다. 페이지를 새로고침해주세요.");
      return;
    }
    const targetLane = boardLanes[laneIndex];
    const slotIndex = targetLane.findIndex(c => !c);

    if (slotIndex === -1) {
      return;
    }

    const isMoveAction = origin === "board" && fromLaneIndex !== undefined && fromSlotIndex !== undefined;

    if (isMoveAction) {
      if (fromLocationId === 9) {
        alert("이 구역에서는 카드를 이동할 수 없습니다.");
        return;
      }

      const sourceLocationId = fromLocationId ?? locations?.[fromLaneIndex]?.locationId;
      const limited = isMoveLimitedPerTurn(card);
      const alreadyMoved = limited && movedThisTurn[card.cardId] === turn;

      if (!canMoveCard(card, sourceLocationId) || alreadyMoved) {
        console.warn("이동 불가능한 카드이거나 이번 턴에 이미 이동했습니다.");
        return;
      }

      const prevBoardLanes = boardLanes.map((lane) => [...lane]);
      const prevPowers = [...myPowers];

      setBoardLanes((prevLanes) => {
        const newLanes = prevLanes.map((lane) => [...lane]);
        const originLane = [...newLanes[fromLaneIndex]];
        originLane[fromSlotIndex] = null;
        newLanes[fromLaneIndex] = originLane;

        const newTargetLane = [...newLanes[laneIndex]];
        newTargetLane[slotIndex] = card;
        newLanes[laneIndex] = newTargetLane;
        return newLanes;
      });

      if (fromLaneIndex !== laneIndex) {
        setMyPowers((prev) => {
          const next = [...prev];
          next[fromLaneIndex] = Math.max(0, (next[fromLaneIndex] ?? 0) - (card?.power ?? 0));
          next[laneIndex] = (next[laneIndex] ?? 0) + (card?.power ?? 0);
          return next;
        });
      }

      if (limited) {
        setMovedThisTurn((prev) => ({ ...prev, [card.cardId]: turn }));
      }

      try {
        const response = await playAction(matchId, {
          playId: 0,
          matchId,
          participantId: user.participantId,
          cardId: card.cardId,
          actionType: "MOVE_CARD",
          additionalData: JSON.stringify({
            fromSlotIndex: fromLaneIndex,
            fromCardPosition: fromSlotIndex,
            toSlotIndex: laneIndex,
            toCardPosition: slotIndex,
            fromLocationId: sourceLocationId,
            toLocationId,
          }),
        });

        const normalizePowers = (source) =>
          Array.isArray(source) ? source.map((value) => Number(value) || 0) : null;

        const myLocationPowers = normalizePowers(response?.myLocationPowers);
        if (myLocationPowers) {
          setMyPowers(myLocationPowers);
        }
      } catch (error) {
        console.error("MOVE_CARD playAction 실패:", error);

        setBoardLanes(prevBoardLanes);
        setMyPowers(prevPowers);
        if (limited) {
          setMovedThisTurn((prev) => {
            const next = { ...prev };
            delete next[card.cardId];
            return next;
          });
        }
        alert(`카드 이동 실패: ${error.message || "알 수 없는 오류"}`);
      }

      return;
    }

    // 이전 상태 저장 (실패 시 롤백용)
    const prevHand = hand;
    const prevBoardLanes = boardLanes;
    const prevEnergy = energy;
    // 낙관적 업데이트: 먼저 UI 업데이트
    setHand((prevHand) => prevHand.filter((c) => c.cardId !== card.cardId));
    setBoardLanes((prevLanes) => {
    const newLanes = [...prevLanes]; // 전체 레인 배열 복사
    const newTargetLane = [...newLanes[laneIndex]]; // 현재 레인 복사
    newTargetLane[slotIndex] = card; // 빈 슬롯에 카드 배치
    newLanes[laneIndex] = newTargetLane; // 변경된 레인으로 교체
    return newLanes;
  });
    setCardPlayed(true);
    setMyPowers((prev) => {
      const next = [...prev];
      next[laneIndex] = (next[laneIndex] ?? 0) + (card?.power ?? 0);
      return next;
    });
    // 에너지 낙관적 업데이트: 카드 비용 즉시 차감
    setEnergy((prev) => Math.max(0, (prev ?? 0) - (card?.cost ?? 0)));

    try {
      // 서버에 카드 플레이 요청
      // 백엔드의 slotIndex는 Location 슬롯 (0~2)을 의미하므로 laneIndex를 사용
      // cardPosition은 해당 지역 내에서의 위치 (0~3)
      // participantId는 guestId를 의미함
      const response = await playAction(matchId, {
        participantId: user.guestId,
        cardId: card.cardId,
        actionType: "PLAY_CARD",
        additionalData: JSON.stringify({ 
          slotIndex: laneIndex,
          cardPosition: slotIndex 
        }),
      });

      console.log(`[GameLayout] 카드 ${card.name}가 lane ${laneIndex} (slotIndex: ${laneIndex}), 슬롯 내부 위치 ${slotIndex}에 놓였습니다.`, response);
      
      console.log("response.energy=", response.energy);
      if (response.energy !== undefined) {
        setEnergy(response.energy);
        console.log("에너지 업데이트: energy=", response.energy);
      }

      const normalizePowers = (source) =>
        Array.isArray(source) ? source.map((value) => Number(value) || 0) : null;

      const myLocationPowers = normalizePowers(response?.myLocationPowers);
      if (myLocationPowers) {
        setMyPowers(myLocationPowers);
      }
      // 응답에서 받은 effect를 boardLanes의 카드에 업데이트
      if (response?.effect !== undefined) {
        setBoardLanes((prevLanes) => {
          const newLanes = [...prevLanes];
          const newTargetLane = [...newLanes[laneIndex]];
          if (newTargetLane[slotIndex]) {
            newTargetLane[slotIndex] = {
              ...newTargetLane[slotIndex],
              effect: response.effect
            };
          }
          newLanes[laneIndex] = newTargetLane;
          return newLanes;
        });
      }
    } catch (error) {
      console.error("playAction 실패:", error);
      console.log("playAction 호출 실패:", matchId, user.participantId, card.cardId, laneIndex, slotIndex, error.energy);
      
      // 실패 시 롤백: 손패, 보드, 파워, 에너지 복원
      setHand(prevHand);
      setBoardLanes(prevBoardLanes);
      setMyPowers((prev) => {
        const next = [...prev];
        next[laneIndex] = Math.max(0, (next[laneIndex] ?? 0) - (card?.power ?? 0));
        return next;
      });
      setEnergy(prevEnergy); // 에너지 롤백
      setCardPlayed(false);
      
      // 사용자에게 에러 알림
      alert(`카드를 낼 수 없습니다. 에너지 수를 확인해 주세요!`);
    }
  };

  return (
    <>
    <div className={`gameplay-shell ${isReviewingBoard ? "is-review-mode" : ""}`}>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <CustomDragLayer selectedCard={selectedCard} />
        <div className="gameplay-body">
          <div className="hud-matchup hud-matchup--mobile" aria-label="플레이어 정보">
            <span className="hud-player hud-player--opponent" title={opponentName}>{opponentName}</span>
            <span className="hud-vs" aria-hidden="true">VS</span>
            <span className="hud-player hud-player--me" title={myNickname}>{myNickname}</span>
          </div>
          <aside className="hud-panel" aria-label="턴 정보">
            <div className="hud-matchup hud-matchup--desktop" aria-label="플레이어 정보">
              <span className="hud-player hud-player--opponent" title={opponentName}>{opponentName}</span>
              <span className="hud-vs" aria-hidden="true">VS</span>
              <span className="hud-player hud-player--me" title={myNickname}>{myNickname}</span>
            </div>

            <div className="hud-section">
              <Energy value={energy} />
            </div>

            <div className="hud-section turn-panel">
            </div>
            <div className="hud-section">
              <button
                className={`end-turn-button ${shouldShakeButton ? "end-turn-button--shake" : ""}`}
                onClick={endTurn}
                disabled={turn === maxTurn + 1 || isWaitingForOpponent || isInteractionLocked}
              >
                <div
                  className="end-turn-button__timer"
                  style={{
                    width: `${turnTimerFillPercent}%`,
                    opacity: isTurnTimerVisible ? 1 : 0,
                  }}
                />
                {shouldShowCountdown && (
                  <div className="end-turn-button__countdown">
                    {secondsLeft}
                  </div>
                )}
                <div
                  className="end-turn-button__label"
                  style={{ opacity: shouldShowCountdown ? 0 : 1 }}
                  aria-hidden={shouldShowCountdown}
                >
                  <span>{endTurnButtonLabel.line1}</span>
                  <br />
                  <span>{endTurnButtonLabel.line2}</span>
                </div>
              </button>
            </div>
          </aside>

          <main className="board-wrapper" aria-label="게임 보드">
            <div className="board-grid" role="group" aria-label="슬롯 및 지역">
              {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                <div className="board-cell board-cell--slot board-cell--enemy" key={`enemy-slot-${i}`}>
                  <Slot 
                    key={`enemy-${i}`} 
                    isMySide={false} 
                    cards={opponentBoardLanes[i] || isInteractionLocked}
                    onCardClick={handleCardClick}
                    selectedCardId={selectedCardId}
                  />
                </div>
              ))}

              {loading && (
                <div className="board-message board-message--full">위치 불러오는 중…</div>
              )}
              {error && (
                <div className="board-message board-message--error board-message--full">⚠ {error}</div>
              )}
              {!loading && !error && locations.length === SLOT_COUNT &&
                locations.map((loc, i) => {
                  const turnsLeft = i + 1 - turn;
                  return (
                    <div className="board-cell board-cell--location" key={`location-${loc.locationId}`}>
                      <Location
                        locationId={loc.locationId}
                        name={loc.name}
                        imageUrl={loc.imageUrl}
                        effectDesc={loc.effectDesc}
                        active={loc.isActive}
                        turnsLeft={turnsLeft > 0 ? turnsLeft : 0}
                        opponentPower={opponentPowers[i]}
                        myPower={myPowers[i]}
                        onLocationClick={
                          !isInteractionLocked ? () => handleLocationClick(loc, i) : undefined
                        }
                      />
                    </div>
                  );
                })}
              {!loading && !error && locations.length !== SLOT_COUNT && (
                <div className="board-message board-message--full">위치 정보가 없습니다.</div>
              )}

              {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                <div className="board-cell board-cell--slot board-cell--ally" key={`ally-slot-${i}`}>
                  <Slot 
                    key={`ally-${i}`} 
                    isMySide={true} 
                    laneIndex={i}                 
                    onDropCard={handleCardDrop}
                    cards={boardLanes[i]}
                    locationId={locations[i]?.locationId}
                    onCardClick={handleCardClick}
                    selectedCardId={selectedCardId}
                  />
                </div>
              ))}
            </div>
              </main>
          <aside className="hand-panel" aria-label="내 손패">
            <div className="hand-grid">
              {hand.map((card) => (
                <div
                  key={card.cardId}
                  className="hand-card"
                  onClick={!isInteractionLocked ? (e) => handleCardClick(card, e) : undefined}
                >
                  <Card
                    {...card}
                    isDraggable={!isInteractionLocked && !isWaitingForOpponent}
                    isSelected={selectedCardId === card.cardId}
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </DndProvider>
    </div>
      <GameChatFloatingButton matchId={matchId} />

      {isGameEnded && !gameEndModalState.isOpen && (
        <button
          type="button"
          className="final-home-button"
          onClick={handleConfirmGameEnd}
        >
          홈으로 이동
        </button>
      )}

      {selectedCard && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <EnlargedCard card={selectedCard}/>
        </div>
      )}
      {selectedLocation && (
        <div className="modal-backdrop" onClick = {handleCloseLocationModal}>
          <EnlargedLocation
            location={selectedLocation}
          />
        </div>
      )}
      <GameEndModal
        isOpen={gameEndModalState.isOpen}
        detail={gameEndModalState.detail}
        onConfirm={handleConfirmGameEnd}
        onViewBoard={handleViewFinalBoard}
      />
    </>
  );
}
// src/Components/GamePlay/GameLayout.jsx
import { useState, useEffect, useMemo} from "react";
import { useUser } from "../../contexts/UserContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNavigate } from "react-router-dom";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import Slot from "./Slot";
import EnlargedCard from "./EnlargedCard";
import EnlargedLocation from "./EnlargedLocation";
import CustomDragLayer from "./CustomDragLayer";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";
// import { fetchLocations } from "./api/location";
import GameChatFloatingButton from "./GameChatFloatingButton";
import GameEndModal from "./GameEndModal";
import { getMatch, verifyParticipant } from "../Home/api/match";
import { fetchLocationsByMatchId } from "./api/location";
import { playAction } from "./api/matchTurn";
import useMatchWebSocket from "./GameLayout/hooks/useMatchWebSocket";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";


let pressTimer = null;

const handlePressStart = (card, setSelectedCard, e) => {
  // 모바일에서 터치할 때, 또는 우클릭일 때 메뉴 방지
  if (e.type === "touchstart" || e.button === 2) e.preventDefault();

  const wrapper = e.currentTarget?.querySelector?.(".card-wrapper");
  wrapper?.classList.add("is-pressed");

  pressTimer = setTimeout(() => {
    setSelectedCard(card);
  }, 600);
};

const handlePressEnd = (e) => {
  clearTimeout(pressTimer);
  const wrapper = e?.currentTarget?.querySelector?.(".card-wrapper");
  wrapper?.classList.remove("is-pressed");
};

export default function GameLayout({ matchId }) {
  const maxTurn = 6;
  const navigate = useNavigate();

  const { user, updateUser } = useUser();
  const [selectedCard, setSelectedCard] = useState(null);
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

  const { subscribe } = useWebSocket();

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
          imageUrl: item.imageUrl || DCI,
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
    setGameEndModalState,
  });

  useEffect(() => {
    setIsWaitingForOpponent(false);
  }, [matchId]);

  const endTurnButtonLabel = useMemo(() => {
    if (isWaitingForOpponent) {
      return "상대의 턴을 기다리는 중...";
    }
    return `턴 종료 (${turn} / ${maxTurn})`;
  }, [isWaitingForOpponent, turn, maxTurn]);

  // const handleCardClick = (cardData) => {
  //   setSelectedCard(cardData);
  // };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const endTurn = async () => {
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
  // turn에 따라 해당 지역의 슬롯 활성화 상태를 결정
  const getLocationDisabled = (index) => {
    // 1번째 지역은 turn >= 1일 때 활성, 2번째는 turn >= 2일 때 활성, 3번째는 turn >= 3일 때 활성
    return turn < index + 1;
  };

  const handleLocationClick = (locationData, index) => {
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
    navigate("/home");
  };

  const handleCardDrop = async ({ card, laneIndex}) => {
    if (!card || !card.cardId) {
      console.warn("[GameLayout] Slot에서 유효하지 않은 카드 데이터를 받았습니다.", { card, laneIndex, slotIndex });
      return;
    }

    // participantId가 없으면 요청 불가
    if (!user?.participantId) {
      console.warn("participantId 없음 → play-action 전송 스킵");
      alert("참가자 정보가 없습니다. 페이지를 새로고침해주세요.");
      return;
    }
    const targetLane = boardLanes[laneIndex]; //이 레인의 첫 번째 빈 슬롯(0~3)을 찾습니다.
    const slotIndex = targetLane.findIndex(c => !c); // 0~3 사이의 인덱스

    if (slotIndex === -1) {
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
      const errorMessage = error.message || "카드 제출에 실패했습니다.";
      alert(`카드 제출 실패: ${errorMessage}`);
    }
  };

  return (
    <>
    <div className="gameplay-shell">
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <div className="gameplay-body">
          <aside className="hud-panel" aria-label="턴 정보">
            <div className="hud-matchup" aria-label="플레이어 정보">
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
              <button className="end-turn-button" onClick={endTurn}
              disabled={turn === maxTurn + 1 || isWaitingForOpponent}>
              {endTurnButtonLabel}
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
                    disabled={getLocationDisabled(i)}
                    cards={opponentBoardLanes[i]}
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
                        onLocationClick={() => handleLocationClick(loc, i)}
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
                    disabled={getLocationDisabled(i)}
                    laneIndex={i}                 
                    onDropCard={handleCardDrop}
                    cards={boardLanes[i]}
                  />
                </div>
              ))}
            </div>
              <section className="hand-row" aria-label="내 손패">
                <div className="hand-grid">
                  {hand.map((card) => (
                  <div
                    key={card.cardId}
                    className="hand-card"
                    onMouseDown={(e) => handlePressStart(card, setSelectedCard, e)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={(e) => handlePressStart(card, setSelectedCard, e)}
                    onTouchEnd={handlePressEnd}
                    onTouchMove={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()} //배포
                  >
                    <div className="card-wrapper">
                      <div className="card-outline" aria-hidden>
                        <span className="outline-top" />
                        <span className="outline-right" />
                        <span className="outline-bottom" />
                        <span className="outline-left" />
                      </div>
                      <Card {...card} isDraggable={true} />
                    </div>
                  </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </DndProvider>
      </div>
      <GameChatFloatingButton matchId={matchId} />

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
      />
    </>
  );
}
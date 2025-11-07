// src/Components/GamePlay/GameLayout.jsx

import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import Slot from "./Slot";
import EnlargedCard from "./EnlargedCard";
import EnlargedLocation from "./EnlargedLocation";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";
// import { fetchLocations } from "./api/location";
import GameChatFloatingButton from "./GameChatFloatingButton";
import { getMatch } from "../Home/api/match";
import { fetchLocationsByMatchId } from "./api/location";
import { playAction } from "./api/matchTurn";
// import { startNextTurn } from "./api/matchTurn";


export default function GameLayout({ matchId }) {
  const handCount = 12;
  const maxTurn = 6;

  const { user, updateUser } = useUser();
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opponentPowers] = useState([0, 0, 0]);
  const [myPowers] = useState([0, 0, 0]);
  const [turn, setTurn] = useState(1);
  const [hand, setHand] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [cardPlayed, setCardPlayed] = useState(false); // 카드 플레이 여부 (향후 턴 종료 로직에서 사용 예정)
  const [energy, setEnergy] = useState(3);
  const [allCards, setAllCards] = useState([]);

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


  // 선택한 덱의 카드들을 불러와 hand와 allCards 구성
  useEffect(() => {
    async function loadDeckCards() {
      if (!user?.selectedDeckPresetId) return;
      try {
        const resDeck = await fetch(`${import.meta.env.VITE_API_BASE}/api/deck-presets/${user.selectedDeckPresetId}`);
        if (!resDeck.ok) throw new Error(`Failed to load deck preset: ${resDeck.status}`);
        const deckData = await resDeck.json();
        const deck = deckData.result ?? deckData;
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
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        setAllCards(mapped);
        setHand(mapped.slice(0, 3));
      } catch (e) {
        console.error("덱 카드 불러오기 실패:", e);
      }
    }
    loadDeckCards();
  }, [user?.selectedDeckPresetId]);

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
  }, [matchId]);

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const endTurn = async () => {
    if (turn < maxTurn) {
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

        // 턴 증가
        setTurn((prev) => prev + 1);
        setCardPlayed(false); // 다시 비활성화

        setHand((prev) => {
          const nextIndex = prev.length;
          if (nextIndex < Math.min(handCount, allCards.length)) {
            return [...prev, allCards[nextIndex]];
          }
          return prev;
        });
      } catch (error) {
        console.error("턴 종료 실패:", error);
        alert(`턴 종료에 실패했습니다: ${error.message || "알 수 없는 오류"}`);
      }
    }
  };

  const SLOT_COUNT = 3;
  // turn에 따라 슬롯 활성화 상태를 결정
  const getSlotDisabled = (index) => {
  // 1번 슬롯은 turn >= 1일 때 활성, 2번은 turn >= 2일 때 활성, 3번은 turn >= 3일 때 활성
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

  const handleCardDrop = async ({ card, laneIndex, slotIndex }) => {
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

    // 이전 상태 저장 (실패 시 롤백용)
    const prevHand = hand;

    // 낙관적 업데이트: 먼저 UI 업데이트
    setHand((prevHand) => prevHand.filter((c) => c.cardId !== card.cardId));
    setCardPlayed(true);

    try {
      // 서버에 카드 플레이 요청
      // 백엔드의 slotIndex는 Location 슬롯 (0~2)을 의미하므로 laneIndex를 사용
      // participantId는 guestId를 의미함
      const response = await playAction(matchId, {
        participantId: user.guestId,
        cardId: card.cardId,
        actionType: "PLAY_CARD",
        additionalData: JSON.stringify({ slotIndex: laneIndex }),
      });

      console.log(`[GameLayout] 카드 ${card.name}가 lane ${laneIndex} (slotIndex: ${laneIndex}), 슬롯 내부 위치 ${slotIndex}에 놓였습니다.`, response);
      
      console.log("response.energy=", response.energy);
      if (response.energy !== undefined) {
        setEnergy(response.energy);
        console.log("에너지 업데이트: energy=", response.energy);
      }

    } catch (error) {
      console.error("playAction 실패:", error);
      console.log("playAction 호출 실패:", matchId, user.participantId, card.cardId, laneIndex, slotIndex, error.energy);
      
      // 실패 시 롤백: 손패 복원
      setHand(prevHand);
      setCardPlayed(false);
      
      // 사용자에게 에러 알림
      const errorMessage = error.message || "카드 제출에 실패했습니다.";
      alert(`카드 제출 실패: ${errorMessage}`);
    }
  };

  return (
    <>
    <div className="gl-wrap">
      <section className="gl-lanes3">
        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
    <Slot key={`enemy-${i}`} isMySide={false} disabled={getSlotDisabled(i)} />
    ))}
      </section>
      {/* 중앙 정육각 3개 */}
      <section className="gl-hexRow">
        {loading && <div className="loading">위치 불러오는 중...</div>}
        {error && <div className="error">⚠ {error}</div>}
        {!loading && !error && locations.length === 3 && (
    <>
      {locations.map((loc, i) => {
        const turnsLeft = i + 1 - turn; // 남은 턴 계산 (예: turn=1일 때 i=1 → 1턴 뒤 활성)
        return (
          <Location
            key={loc.locationId}
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
        );
      })}
    </>
    )}
    </section>

      <section className="gl-lanes3">
        {Array.from({ length: SLOT_COUNT }).map((_, i) => (
          <Slot 
            key={`ally-${i}`} 
            isMySide={true} 
            disabled={getSlotDisabled(i)}
            laneIndex={i}                 
            onDropCard={handleCardDrop}   
          />
        ))}
      </section>

      {/* <div className="gl-buttons-wrap">
        <Energy value={energy} />
        <button className="gl-endBtn" onClick={endTurn}
            disabled={!cardPlayed || turn === maxTurn}>
            턴 종료 ({turn} / {maxTurn})
        </button>
      </div> */}
      <div className="gl-buttons-wrap">
        <Energy value={energy} />
        <button className="gl-endBtn" onClick={endTurn}
            disabled={turn === maxTurn}>
            턴 종료 ({turn} / {maxTurn})
        </button>
      </div>

      {/* 손패 */}
        <section className="gl-hand12">
          {hand.map((card) => (
            <div
              key={card.cardId}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("application/json", JSON.stringify(card))
              }
            >
              <Card {...card} onCardClick={() => handleCardClick(card)} />
            </div>
          ))}
        </section>

    </div>

    <GameChatFloatingButton matchId={matchId} />
    
      {selectedCard && (
        <div className="modal-backdrop">
          <EnlargedCard card={selectedCard} onClose={handleCloseModal} />
        </div>
      )}
      {selectedLocation && (
        <div className="modal-backdrop">
          <EnlargedLocation
            location={selectedLocation}
            onClose={handleCloseLocationModal}
          />
        </div>
      )}
    </>
  );
}
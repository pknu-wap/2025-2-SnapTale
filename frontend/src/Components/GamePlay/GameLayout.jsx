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
import { fetchLocationsByMatchId } from "./api/location";


export default function GameLayout({ matchId }) {
  const handCount = 12;
  const maxTurn = 6;

  const { user } = useUser();
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opponentPowers] = useState([0, 0, 0]);
  const [myPowers] = useState([0, 0, 0]);
  const [turn, setTurn] = useState(1);
  const [hand, setHand] = useState([]);
  const [cardPlayed, setCardPlayed] = useState(false);
  const [energy] = useState(3);
  const [allCards, setAllCards] = useState([]);


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

  const handleCardPlay = (cardId) => {
    setHand((prev) => prev.filter((c) => c.cardId !== cardId)); // 카드 제거
    setCardPlayed(true); // ✅ 카드 냈으니 턴 종료 가능
  };

  const endTurn = () => {
    if (turn < maxTurn) {
      setTurn((prev) => prev + 1);
      setCardPlayed(false); // 다시 비활성화

      setHand((prev) => {
        const nextIndex = prev.length;
        if (nextIndex < Math.min(handCount, allCards.length)) {
          return [...prev, allCards[nextIndex]];
        }
        return prev;
      });
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
          <Slot key={`ally-${i}`} isMySide={true} disabled={getSlotDisabled(i)} />
        ))}
      </section>

      <div className="gl-buttons-wrap">
        <Energy value={energy} />
        <button className="gl-endBtn" onClick={endTurn}
            disabled={!cardPlayed || turn === maxTurn}>
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
              onDragEnd={() => handleCardPlay(card.cardId)} // ✅ 임시 드래그로 낸 걸로 처리
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
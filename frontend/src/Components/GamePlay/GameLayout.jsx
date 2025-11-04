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
import { playAction, startNextTurn } from "./api/matchTurn";


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
  const [cardPlayed, setCardPlayed] = useState(false);
  const [energy] = useState(3);
  const [allCards, setAllCards] = useState([]);

  useEffect(() => {
    async function ensureParticipant() {
      if (!matchId || !user?.guestId) return;
      if (user.participantId) return; // 이미 있으면 스킵

      try {
        const match = await getMatch(matchId);
        const me = match?.participants?.find(p => p.guestId === user.guestId);
        if (me?.participantId) {
          // UserContext 메모리에만 저장(로컬스토리지는 기존 필드만 저장됨)
          updateUser({ participantId: me.participantId });
        }
      } catch (e) {
        console.warn("participantId 조회 실패:", e);
      }
    }
    ensureParticipant();
  }, [matchId, user?.guestId, user?.participantId, updateUser]);

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

const handleDropCard = async ({ laneIndex, slotIndex, card }) => {
  if (!user?.participantId) {
    console.warn("participantId 없음 → play-action 전송 스킵");
    return;
  }
  const prevHand = hand;
  setHand((h) => h.filter((c) => c.cardId !== card.cardId));

  try {
    await playAction(matchId, {
      participantId: user.participantId,
      cardId: card.cardId,
      actionType: "PLAY_CARD",
      additionalData: JSON.stringify({ laneIndex, slotIndex, turn }),
    });
    setCardPlayed(true);
  } catch (e) {
      console.error("playAction 실패:", e);
      setHand(prevHand);
    }
  };

  // // 샘플 카드 데이터 12장 (임의 생성)
  // const sampleCards = Array.from({ length: handCount }).map((_, i) => ({
  //   cardId: `card-${i}`,
  //   name: `Card ${i + 1}`,
  //   imageUrl: DCI,
  //   cost: Math.floor(Math.random() * 10) + 1,    // 1~10 랜덤
  //   power: Math.floor(Math.random() * 10) + 1,   // 1~10 랜덤
  //   faction: ["korea", "china", "japan"][i % 3], // 번갈아 korea, china, japan
  //   effectDesc: "Sample effect description",
  //   active: true,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString()
  // }));

  // const endTurn = () => {
  //   if (turn < maxTurn) {
  //     setTurn((prev) => prev + 1);
  //     setCardPlayed(false); // 다시 비활성화

  //     setHand((prev) => {
  //       const nextIndex = prev.length;
  //       if (nextIndex < Math.min(handCount, allCards.length)) {
  //         return [...prev, allCards[nextIndex]];
  //       }
  //       return prev;
  //     });
  //   }
  // };

  const endTurn = async () => {
  if (!cardPlayed || turn === maxTurn) return;

  const prev = { turn, hand };
  setTurn((t) => t + 1);
  setCardPlayed(false);

  try {
    console.log("🎯 startNextTurn 호출:", matchId);
    const data = await startNextTurn(matchId);
    console.log("✅ startNextTurn 응답:", data);

    if (!data.success) throw new Error(data.message || "turn start failed");

    setTurn(data.result.turn);
    const drawn = Object.values(data.result.drawnCards ?? {});
    setHand((h) => [...h, ...drawn]);
  } catch (e) {
    console.error("❌ startNextTurn 실패:", e);
    setTurn(prev.turn);
    setHand(prev.hand);
    setCardPlayed(true);
  }
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
        <Slot isMySide={false} />
        <Slot isMySide={false} />
        <Slot isMySide={false} />
      </section>
      {/* 중앙 정육각 3개 */}
      <section className="gl-hexRow">
        {loading && <div className="loading">위치 불러오는 중...</div>}
        {error && <div className="error">⚠ {error}</div>}
        {!loading && !error && locations.length === 3 && (
        <>
          <Location
            key={locations[0].locationId}
            locationId={locations[0].locationId}
            name={locations[0].name}
            imageUrl={locations[0].imageUrl}
            effectDesc={locations[0].effectDesc}
            active={locations[0].active}
            opponentPower={opponentPowers[0]}
            myPower={myPowers[0]}
            onLocationClick={() =>
            handleLocationClick(locations[0], 0)
            }
          />

          <Location
            key={locations[1].locationId}
            locationId={locations[1].locationId}
            name={locations[1].name}
            imageUrl={locations[1].imageUrl}
            effectDesc={locations[1].effectDesc}
            active={locations[1].active}
            opponentPower={opponentPowers[1]}
            myPower={myPowers[1]}
            onLocationClick={() =>
              handleLocationClick(locations[1], 1)
            }
          />

          <Location
            key={locations[2].locationId}
            locationId={locations[2].locationId}
            name={locations[2].name}
            imageUrl={locations[2].imageUrl}
            effectDesc={locations[2].effectDesc}
            active={locations[2].active}
            opponentPower={opponentPowers[2]}
            myPower={myPowers[2]}
            onLocationClick={() =>
              handleLocationClick(locations[2], 2)
            }
          />
        </>
      )}
    </section>

      <section className="gl-lanes3">
        {/* 내 칸: laneIndex와 onDropCard 넘김 */}
        <Slot isMySide laneIndex={0} onDropCard={handleDropCard} />
        <Slot isMySide laneIndex={1} onDropCard={handleDropCard} />
        <Slot isMySide laneIndex={2} onDropCard={handleDropCard} />
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
            >
              <Card {...card} onCardClick={() => handleCardClick(card)} />
            </div>
          ))}
        </section>

      {/* 손패 6x2 = 12
      <section className="gl-hand12">
        {sampleCards.map(card => (
          <div
            key={card.cardId}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("application/json", JSON.stringify(card))}
          >
          <Card
            key={card.cardId}
            cardId={card.cardId}
            name={card.name}
            imageUrl={card.imageUrl}
            cost={card.cost}
            power={card.power}
            faction={card.faction}
            effectDesc={card.effectDesc}
            active={card.active}
            createdAt={card.createdAt}
            updatedAt={card.updatedAt}
            onCardClick={() => handleCardClick(card)}
          />
          </div>
        ))}
      </section> */}

      
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
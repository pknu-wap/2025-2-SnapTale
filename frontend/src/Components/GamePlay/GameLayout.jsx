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
        // 덱 프리셋 조회
        const resDeck = await fetch(`${import.meta.env.VITE_API_BASE}/api/deck-presets/${user.selectedDeckPresetId}`);
        if (!resDeck.ok) throw new Error(`Failed to load deck preset: ${resDeck.status}`);
        const deckData = await resDeck.json();
        const deck = deckData.result ?? deckData;
        const cardIds = (deck.cards ?? []).map(c => c.cardId);

        // 카드 상세 병렬 조회
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

        // 서버 응답 구조: { success, code, message, result: [...] }
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

          // slotIndex 순서로 정렬 (서버에서 이미 3개를 선택해서 보내줌)
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
        <Slot isMySide />
        <Slot isMySide />
        <Slot isMySide />
      </section>

      <div className="gl-buttons-wrap">
        <Energy value={energy}/>
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
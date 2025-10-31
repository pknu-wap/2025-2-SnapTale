// src/Components/GamePlay/GameLayout.jsx
import { useState, useEffect } from "react";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import Slot from "./Slot";
import EnlargedCard from "./EnlargedCard";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";
import { fetchLocations } from "./api/location";

export default function GameLayout() {
  const handCount = 12;
  const maxTurn = 6;

  const [selectedCard, setSelectedCard] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opponentPowers, setOpponentPowers] = useState([0, 0, 0]);
  const [myPowers, setMyPowers] = useState([0, 0, 0]);
  const [turn, setTurn] = useState(1);
  const [hand, setHand] = useState([]);
  const [cardPlayed, setCardPlayed] = useState(false);
  const [energy, setEnergy] = useState(3);

  //카드 12장 생성
  const allCards = Array.from({ length: handCount }).map((_, i) => ({
    cardId: `card-${i}`,
    name: `Card ${i + 1}`,
    imageUrl: DCI,
    cost: Math.floor(Math.random() * 10) + 1,
    power: Math.floor(Math.random() * 10) + 1,
    faction: ["korea", "china", "japan"][i % 3],
    effectDesc: "Sample effect description",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        const data = await fetchLocations();

        // 서버 응답 구조: { success, code, message, result: [...] }
        if (data.success && Array.isArray(data.result)) {
          console.log("서버에서 받은 locations 개수:", data.result.length);

          const formatted = data.result.map((item) => ({
            locationId: item.locationId,
            name: item.name,
            imageUrl: item.imageUrl || defaultImg,
            effectDesc: item.effectDesc,
            isActive: item.active,
            revealedTurn: item.revealedTurn,
            matchId: item.matchId,
            slotIndex: item.slotIndex,
          }));

          // 랜덤으로 3개 선택
          const shuffled = [...formatted].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 3);
          console.log("랜덤으로 선택된 지역 ID:", selected[0].locationId, selected[1].locationId, selected[2].locationId);

          setLocations(selected);
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
    setHand(allCards.slice(0, 3));
  }, []);

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
        if (nextIndex < handCount) {
          return [...prev, allCards[nextIndex]];
        }
        return prev;
      });
    }
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
              alert(`${locations[0].name} 클릭됨! (효과: ${locations[0].effectDesc})`)
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
              alert(`${locations[1].name} 클릭됨! (효과: ${locations[1].effectDesc})`)
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
              alert(`${locations[2].name} 클릭됨! (효과: ${locations[2].effectDesc})`)
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
    </>
  );
}
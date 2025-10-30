// src/Components/GamePlay/GameLayout.jsx
import { useState, useEffect } from "react";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import EnlargedCard from "./EnlargedCard";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";
import { fetchLocations } from "./api/location";

export default function GameLayout() {
  const lanes = 3;                 // 왼/중/오
  const topCountPerLane = 4;       // 위 4장
  const botCountPerLane = 4;       // 아래 4장
  const handCount = 12;            // 6x2
  const [selectedCard, setSelectedCard] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  // 샘플 카드 데이터 12장 (임의 생성)
  const sampleCards = Array.from({ length: handCount }).map((_, i) => ({
    cardId: `card-${i}`,
    name: `Card ${i + 1}`,
    imageUrl: DCI,
    cost: Math.floor(Math.random() * 10) + 1,    // 1~10 랜덤
    power: Math.floor(Math.random() * 10) + 1,   // 1~10 랜덤
    faction: ["korea", "china", "japan"][i % 3], // 번갈아 korea, china, japan
    effectDesc: "Sample effect description",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return (
  <div>
    <div className="gl-wrap">
      <div className="gl-oppo-chip">상대닉네임</div>

      {/* 위 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`top-${laneIdx}`}>
            {Array.from({ length: topCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`t-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      {/* 중앙 정육각 3개 */}
      <section className="gl-hexRow">
          {loading && <div className="loading">위치 불러오는 중...</div>}
          {error && <div className="error">⚠ {error}</div>}
          {!loading &&
            !error &&
            locations.map((loc) => (
              <Location
                key={loc.locationId}
                {...loc}
                onLocationClick={() =>
                  alert(`${loc.name} 클릭됨! (효과: ${loc.effectDesc})`)
                }
              />
            ))}
        </section>

      {/* 아래 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`bot-${laneIdx}`}>
            {Array.from({ length: botCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`b-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      <div className="gl-turnOrb">1</div>

      {/* 손패 6x2 = 12 */}
      <section className="gl-hand12">
        {sampleCards.map(card => (
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
        ))}
      </section>
      <footer className="gl-footer">
        <button className="gl-endBtn">턴 종료 (1/6)</button>
      </footer>
    </div>
      {selectedCard && (
        <div className="modal-backdrop">
          <EnlargedCard card={selectedCard} onClose={handleCloseModal} />
        </div>
      )}
  </div>
  );
}

// src/Components/GamePlay/GameLayout.jsx
import { useState } from "react";
import "./GameLayout.css";
import Card from "./Card";
import DCI from "../../assets/defaultCardImg.svg";

export default function GameLayout() {
  const lanes = 3;                 // 왼/중/오
  const topCountPerLane = 4;       // 위 4장
  const botCountPerLane = 4;       // 아래 4장
  const handCount = 12;            // 6x2
  const [selectedCard, setSelectedCard] = useState(null);

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
        {Array.from({ length: lanes }).map((_, i) => (
          <div className="gl-hex" key={`hex-${i}`} />
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
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div 
            className="enlarged-card-container" 
            onClick={(e) => e.stopPropagation()} // 배경 클릭 방지
          >
            {/* 선택된 카드의 정보로 확대된 카드 UI를 구성 */}
            <img 
              className={`card-image card-border-${selectedCard.faction}`} 
              src={selectedCard.imageUrl} 
              alt={selectedCard.name} 
            />
            <div className="card-cost-container">
              <img src="/src/assets/cost.svg" alt="Cost" className="icon" />
              <span className="icon-text">{selectedCard.cost}</span>
            </div>
            <div className="card-power-container">
              <img src="/src/assets/power.svg" alt="Power" className="icon" />
              <span className="icon-text">{selectedCard.power}</span>
            </div>
            <div className="card-name">{selectedCard.name}</div>
            <div className="card-desc">{selectedCard.effectDesc}</div>
          </div>
        </div>
      )}
  </div>
  );
}

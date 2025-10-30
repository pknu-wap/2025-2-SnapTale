// src/Components/GamePlay/GameLayout.jsx
import { useState } from "react";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import EnlargedCard from "./EnlargedCard";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";

export default function GameLayout() {
  const lanes = 3;                 // 왼/중/오
  const topCountPerLane = 4;       // 위 4장
  const botCountPerLane = 4;       // 아래 4장
  const handCount = 12;            // 6x2
  const [selectedCard, setSelectedCard] = useState(null);

   const locations = [
    {
      locationId: 1,
      name: "뉴욕 시티",
      imageUrl: defaultImg,
      opponentPower: 5,
      myPower: 3,
      effectDesc: "카드 효과 +2",
      active: true,
    },
    {
      locationId: 2,
      name: "사하라 사막",
      imageUrl: defaultImg,
      opponentPower: 8,
      myPower: 7,
      effectDesc: "내 카드 파워 +1",
      active: true,
    },
    {
      locationId: 3,
      name: "북극 연구소",
      imageUrl: defaultImg,
      opponentPower: 4,
      myPower: 9,
      effectDesc: "상대 카드 동결",
      active: true,
    },
  ];

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
        <Location
          {...locations[0]}
          onLocationClick={() => alert(`${locations[0].name} 클릭됨!`)}
        />
      <Location
          {...locations[1]}
          onLocationClick={() => alert(`${locations[1].name} 클릭됨!`)}
        />
      <Location
          {...locations[2]}
          onLocationClick={() => alert(`${locations[2].name} 클릭됨!`)}
        />
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

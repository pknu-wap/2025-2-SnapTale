// src/Components/GamePlay/GameLayout.jsx
import { useMemo, useState } from "react";
import "./GameLayout.css";
import Card from "./Card";
import EnlargedCard from "./EnlargedCard";
import defaultCardImage from "../../assets/defaultCardImg.svg";
import DCI from "../../assets/defaultCardImg.svg";

export default function GameLayout({
  cards = [],
  opponentNickname = "상대방",
  currentRound = 1,
}) {
  const [selectedCard, setSelectedCard] = useState(null);

  const playableCards = useMemo(() => cards.map((card) => ({
    ...card,
    imageUrl: card.imageUrl || defaultCardImage,
  })), [cards]);

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
    <div className="gl-wrap">
      <div className="gl-oppo-chip">{opponentNickname}</div>

      <section className="gl-lanes3">
        {Array.from({ length: 3 }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`top-${laneIdx}`}>
            {Array.from({ length: 4 }).map((__, i) => (
              <div className="gl-card" key={`t-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      <section className="gl-hexRow">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="gl-hex" key={`hex-${i}`} />
        ))}
      </section>

      <section className="gl-lanes3">
        {Array.from({ length: 3 }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`bot-${laneIdx}`}>
            {Array.from({ length: 4 }).map((__, i) => (
              <div className="gl-card" key={`b-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      <div className="gl-turnOrb">{currentRound}</div>

      <section className="gl-hand12">
        {playableCards.length === 0 ? (
          <div className="gl-empty-hand">덱에서 카드를 불러오는 중...</div>
        ) : (
          playableCards.map((card) => (
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
          ))
        )}
      </section>

      <footer className="gl-footer">
        <button className="gl-endBtn">턴 종료 (1/6)</button>
      </footer>

      {selectedCard && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <EnlargedCard card={selectedCard} onClose={handleCloseModal} />
        </div>
      )}
    </div>
  );
}

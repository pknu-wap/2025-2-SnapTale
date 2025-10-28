// src/Components/GamePlay/GameLayout.jsx
import { useMemo, useState } from "react";
import "./GameLayout.css";
import Card from "./Card";
import EnlargedCard from "./EnlargedCard";
import DCI from "../../assets/defaultCardImg.svg";
import { useGame } from "../../contexts/GameContext.jsx";

export default function GameLayout() {
  const lanes = 3;
  const topCountPerLane = 4;
  const botCountPerLane = 4;
  const totalHandSlots = 12;
  const [selectedCard, setSelectedCard] = useState(null);
  const { gameState } = useGame();

  const participants = gameState?.participants;
  const participantScores = gameState?.participantScores ?? [];
  const myParticipantId = gameState?.currentUserParticipantId;

  const participantList = useMemo(
    () => Object.values(participants ?? {}),
    [participants],
  );

  const myParticipant = myParticipantId && participants
    ? participants[myParticipantId]
    : null;

  const opponentParticipant = useMemo(
    () => participantList.find((participant) => participant.participantId !== myParticipantId),
    [participantList, myParticipantId],
  );

  const myScore = participantScores.find((score) => score.participantId === myParticipantId);
  const opponentScore = participantScores.find((score) => score.participantId === opponentParticipant?.participantId);

  const handCards = useMemo(() => {
    const cards = myParticipant?.handCards ?? [];
    if (cards.length >= totalHandSlots) {
      return cards.slice(0, totalHandSlots);
    }
    const placeholders = Array.from({ length: totalHandSlots - cards.length }, () => null);
    return [...cards, ...placeholders];
  }, [myParticipant?.handCards]);

  const handleCardClick = (cardData) => {
    if (!cardData) {
      return;
    }
    setSelectedCard(cardData);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const renderCard = (card, index) => {
    if (!card) {
      return <div className="gl-card" key={`placeholder-${index}`} />;
    }

    return (
      <Card
        key={card.cardId}
        cardId={card.cardId}
        name={card.name}
        imageUrl={card.imageUrl || DCI}
        cost={card.cost}
        power={card.power}
        faction={card.faction}
        effectDesc={card.effectDesc}
        active={card.active}
        createdAt={card.createdAt}
        updatedAt={card.updatedAt}
        onCardClick={() => handleCardClick(card)}
      />
    );
  };

  return (
    <div>
      <div className="gl-wrap">
        <div className="gl-scoreboard">
          <div className="gl-score gl-score-opponent">
            <span className="gl-score-name">{opponentScore?.nickname || opponentParticipant?.nickname || "상대"}</span>
            <span className="gl-score-value">{opponentScore?.score ?? 0}</span>
          </div>
          <div className="gl-score gl-score-self">
            <span className="gl-score-name">{myScore?.nickname || myParticipant?.nickname || "나"}</span>
            <span className="gl-score-value">{myScore?.score ?? 0}</span>
          </div>
        </div>

        <section className="gl-lanes3">
          {Array.from({ length: lanes }).map((_, laneIdx) => (
            <div className="gl-laneCol" key={`top-${laneIdx}`}>
              {Array.from({ length: topCountPerLane }).map((__, i) => (
                <div className="gl-card" key={`t-${laneIdx}-${i}`} />
              ))}
            </div>
          ))}
        </section>

        <section className="gl-hexRow">
          {Array.from({ length: lanes }).map((_, i) => (
            <div className="gl-hex" key={`hex-${i}`} />
          ))}
        </section>

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

        <section className="gl-hand12">
          {handCards.map((card, index) => renderCard(card, index))}
        </section>
        <footer className="gl-footer">
          <button className="gl-endBtn" type="button">턴 종료 (1/6)</button>
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

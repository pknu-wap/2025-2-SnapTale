import React, { useMemo } from "react";
import { useDrop } from "react-dnd";
import "./Slot.css";
import Card from "./Card";


export default function Slot({ isMySide = false, laneIndex, onDropCard, disabled = false, cards = [null, null, null, null] }) {
  const firstEmpty = useMemo(() => cards.findIndex((c) => !c), [cards]); //cards 배열에서 첫 번째 빈 칸의 인덱스 찾기
  const isFull = firstEmpty === -1;
  const allowDrop = isMySide && !disabled && !isFull;

  const [{ isOver }, dropRef] = useDrop({
    accept: "CARD",
    canDrop: () => allowDrop,
    drop: (item) => {
      onDropCard?.({ laneIndex, card: item });
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef}
      className={[
        "slot",
        isMySide ? "is-ally" : "is-enemy",
        allowDrop && isOver ? "is-over" : "",
        !isMySide ? "is-disabled" : "",
      ].join(" ")}
    >
      <div className="slot__grid">
        {cards.map((card, i) => (
          <div className="slot__cell" key={i}>
            {card && (
              <Card
                cardId={card.cardId}
                name={card.name}
                imageUrl={card.imageUrl}
                cost={card.cost}
                power={card.power}
                faction={card.faction}
                effectDesc={card.effectDesc}
                effect={card.effect}
                active={card.active}
                createdAt={card.createdAt}
                updatedAt={card.updatedAt}
                onCardClick={() => {}}
                isDraggable={false}
              />
            )}
          </div>
        ))}
      </div>

      {/* 상대쪽은 투명 잠금 레이어(시각적으로 드롭 불가 표시) */}
      {!isMySide && <div className="slot__lock" />}
    </div>
  );
}
import React, { useMemo } from "react";
import { useDrop } from "react-dnd";
import "./Slot.css";
import Card from "./Card";
import { canMoveCard, isMoveLimitedPerTurn } from "./utils/effect";

export default function Slot({
  isMySide = false,
  laneIndex,
  onDropCard,
  cards = [null, null, null, null],
  movedThisTurnMap = {},
  currentTurn = 1,
  locationId = null,
  onCardClick, 
  selectedCardId,
}) {
  const firstEmpty = useMemo(() => cards.findIndex((c) => !c), [cards]); //cards 배열에서 첫 번째 빈 칸의 인덱스 찾기
  const isFull = firstEmpty === -1;
  const allowDrop = isMySide && !isFull;

  const [{ isOver }, dropRef] = useDrop({
    accept: "CARD",
    canDrop: (item) => {
      if (!allowDrop) return false;
      if (item?.origin === "board") {
        if (item.fromLaneIndex === laneIndex) return false; // 같은 지역으로 이동 방지
        if (!canMoveCard(item, item.fromLocationId)) return false;

        const limited = isMoveLimitedPerTurn(item);
        if (limited && movedThisTurnMap[item.cardId] === currentTurn) return false;
      }
      return true;
    },
    drop: (item) => {
      onDropCard?.({
        laneIndex,
        card: item,
        fromLaneIndex: item.fromLaneIndex,
        fromSlotIndex: item.fromSlotIndex,
        origin: item.origin,
        fromLocationId: item.fromLocationId,
        toLocationId: locationId,
      });
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
                origin="board"
                fromLaneIndex={laneIndex}
                fromSlotIndex={i}
                onCardClick={(e) => onCardClick && onCardClick(card, e)}
                isSelected={selectedCardId === card.cardId}
                isDraggable={
                  isMySide &&
                  canMoveCard(card, locationId) &&
                  !(isMoveLimitedPerTurn(card) && movedThisTurnMap[card.cardId] === currentTurn)
                }
                isMoveAvailable={
                  isMySide &&
                  canMoveCard(card, locationId) &&
                  !(isMoveLimitedPerTurn(card) && movedThisTurnMap[card.cardId] === currentTurn)
                }
                locationId={locationId}
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
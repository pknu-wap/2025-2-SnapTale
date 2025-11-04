import React, { useMemo, useState } from "react";
import "./Slot.css";
import Card from "./Card";

export default function Slot({ isMySide = false, disabled = false, onChange }) {
  // 4칸(인덱스 0~3), null = 비어있음
  const [cells, setCells] = useState([null, null, null, null]);
  const [isOver, setIsOver] = useState(false);

  const firstEmpty = useMemo(() => cells.findIndex((c) => !c), [cells]);
  const isFull = firstEmpty === -1;

  const allowDrop = isMySide && !disabled && !isFull;

  const handleDragEnter = (e) => {
    if (!allowDrop) return;
    e.preventDefault(); // 드롭 가능
    setIsOver(true);
  };

  const handleDragOver = (e) => {
    if (!allowDrop) return;
    e.preventDefault();
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e) => {
    setIsOver(false);
    if (!allowDrop) return;
    e.preventDefault();

    // 핸드 카드에서 setData('application/json', JSON.stringify(card))
    const raw =
      e.dataTransfer.getData("application/json") ||
      e.dataTransfer.getData("text/plain");
    if (!raw) return;

    try {
      const card = JSON.parse(raw);

      // 이미 꽉 차있으면 무시
      if (firstEmpty === -1) return;

      setCells((prev) => {
        const next = [...prev];
        next[firstEmpty] = card;
        return next;
      });
      onChange?.(cells);
    } catch {
      // JSON 파싱 실패 시 무시
    }
  };

  return (
    <div
      className={[
        "slot",
        isMySide ? "is-ally" : "is-enemy",
        allowDrop && isOver ? "is-over" : "",
        !isMySide ? "is-disabled" : "",
      ].join(" ")}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="slot__grid">
        {cells.map((card, i) => (
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
                active={card.active}
                createdAt={card.createdAt}
                updatedAt={card.updatedAt}
                onCardClick={() => {}}
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
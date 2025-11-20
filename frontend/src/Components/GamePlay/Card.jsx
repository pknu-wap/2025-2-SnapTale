import React from "react"; 
import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import "./Card.css";
import costIcon from "../../assets/cost.svg";
import powerIcon from "../../assets/power.svg";

/**
 * 게임 카드 정보를 표시하는 컴포넌트입니다.
 * @param {object} props
 * @param {number} props.cardId - 카드 고유 ID (UI 미표시)
 * @param {string} props.name - 카드 이름 (UI 표시)
 * @param {string} props.imageUrl - 카드 이미지 URL (UI 표시)
 * @param {number} props.cost - 카드 코스트 (UI 표시)
 * @param {number} props.power - 카드 파워 (UI 표시)
 * @param {string} props.faction - 카드 진영 (테두리 색상에 사용)
 * @param {string} props.effectDesc - 카드 효과 설명 (카드 클릭 시 UI 표시)
 * @param {string} props.effect - 카드 효과 JSON (서버에서 받은 효과 정보)
 * @param {boolean} props.active - 사용 가능 여부 ? (UI 미표시)
 * @param {string} props.createdAt - 생성일시 (UI 미표시)
 * @param {string} props.updatedAt - 수정일시 (UI 미표시)
 */

const factionClasses = {
  한국: "card-border-korea",
  중국: "card-border-china",
  일본: "card-border-japan"
};

const Card = ({
  cardId,
  name,
  imageUrl,
  cost,
  power,
  faction,
  effectDesc,
  effect,
  active,
  createdAt,
  updatedAt,
  onCardClick,
  isDraggable = false,
  isSelected = false,
}) => {
  console.log({
    cardId,
    name,
    imageUrl,
    cost,
    power,
    faction,
    effectDesc,
    effect,//todo:console에 뜰 수 있게 수정해주세요
    active,
    createdAt,
    updatedAt
  });
    const nameRef = useRef(null);
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: "CARD",
      item: { cardId, name, imageUrl, cost, power, faction, effectDesc, effect },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => isDraggable, // 드래그 가능 여부 제어
    }), [cardId, name, imageUrl, cost, power, faction, effectDesc, effect, isDraggable]);
    useEffect(() => {
      const el = nameRef.current;
    if (!el) return;

    el.style.fontSize = "12px";
    el.style.whiteSpace = "nowrap";

    if (el.scrollWidth > el.clientWidth) {
      el.style.fontSize = "10px";
      el.style.whiteSpace = "normal";
      el.style.wordBreak = "keep-all";
      el.style.lineHeight = "1.1";
    }
  }, [name]);
  const borderClass = factionClasses[faction] || "card-border-default";
  return (
    <div 
      className={`card-container ${isDragging ? "card-dragging" : ""} ${isSelected ? "card-selected" : ""}`} 
      ref={isDraggable ? dragRef : null} //드래그 가능 시에만 DnD ref 연결
      onClick={onCardClick}
    >
      <img className={`card-image ${borderClass} ${isSelected ? "card-image-selected" : ""}`} src={imageUrl} alt={name} />

      <div className="card-cost-container">
        <img src={costIcon} alt="Cost Icon" className="icon" />
        <span className="icon-text">{cost}</span>
      </div>

      <div className="card-power-container">
        <img src={powerIcon} alt="Power Icon" className="icon" />
        <span className="icon-text">{power}</span>
      </div>

      <div className="card-name" ref={nameRef}>{name}</div>
    </div>
  );
};

export default React.memo(Card);
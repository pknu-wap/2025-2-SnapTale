import React from 'react';
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
 * @param {string} props.effectiveDesc - 카드 효과 설명 (카드 클릭 시 UI 표시)
 * @param {boolean} props.active - 사용 가능 여부 ? (UI 미표시)
 * @param {string} props.createdAt - 생성일시 (UI 미표시)
 * @param {string} props.updatedAt - 수정일시 (UI 미표시)
 */

const factionClasses = {
  korea: "card-border-korea",
  china: "card-border-china",
  japan: "card-border-japan"
};

const Card = ({
  cardId,
  name,
  imageUrl,
  cost,
  power,
  faction,
  effectiveDesc,
  active,
  createdAt,
  updatedAt
}) => {
  console.log({
    cardId,
    name,
    imageUrl,
    cost,
    power,
    faction,
    effectiveDesc,
    active,
    createdAt,
    updatedAt
  });
  const borderClass = factionClasses[faction] || "card-border-default";
  return (
    <div className="card-container">
      <img className={`card-image ${borderClass}`} src={imageUrl} alt={name} />

      <div className="card-cost-container">
        <img src={costIcon} alt="Cost Icon" className="icon" />
        <span className="icon-text">{cost}</span>
      </div>

      <div className="card-power-container">
        <img src={powerIcon} alt="Power Icon" className="icon" />
        <span className="icon-text">{power}</span>
      </div>

      <div className="card-name">{name}</div>
    </div>
  );
};

export default Card;
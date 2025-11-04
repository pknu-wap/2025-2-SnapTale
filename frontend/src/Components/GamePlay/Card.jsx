import React from "react"; 
import { useEffect, useRef } from "react";
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
  active,
  createdAt,
  updatedAt,
  onCardClick 
}) => {
  console.log({
    cardId,
    name,
    imageUrl,
    cost,
    power,
    faction,
    effectDesc,
    active,
    createdAt,
    updatedAt
  });
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      
      // 초기 폰트 스타일
      el.style.fontSize = "12px";
      el.style.whiteSpace = "nowrap";
  
      const tooLong = el.scrollWidth > el.clientWidth; // 내용이 card-name div박스를 넘으면 2줄로 표시 허용

      if (tooLong) {
        el.style.fontSize = "10px";
        el.style.whiteSpace = "normal"; // 줄바꿈 허용
        el.style.wordBreak = "keep-all";  //한글 공백 단위로 줄바꿈
        el.style.lineHeight = "1.1";    // 줄 간격 살짝 조정
    }
    }, [name]);
  const borderClass = factionClasses[faction] || "card-border-default";
  return (
    <div className="card-container" 
      onContextMenu={(e) => {
        e.preventDefault(); // 브라우저 기본 우클릭 메뉴 막기
        onCardClick && onCardClick(e); // 우클릭 시 확대
      }}
      
    >
      <img className={`card-image ${borderClass}`} src={imageUrl} alt={name} />

      <div className="card-cost-container">
        <img src={costIcon} alt="Cost Icon" className="icon" />
        <span className="icon-text">{cost}</span>
      </div>

      <div className="card-power-container">
        <img src={powerIcon} alt="Power Icon" className="icon" />
        <span className="icon-text">{power}</span>
      </div>

      <div className="card-name" ref={ref}>{name}</div>
    </div>
  );
};

export default React.memo(Card);;
import React from 'react';
import "./Card.css";

/**
 * 게임 카드 정보를 표시하는 컴포넌트입니다.
 * faction과 effectDesc는 UI에 표시되지 않지만, 데이터는 유지됩니다.
 * @param {object} props - 컴포넌트 속성
 * @param {string} props.name - 카드 이름
 * @param {string} props.imageUrl - 카드 배경 이미지 URL
 * @param {number} props.cost - 카드 비용
 * @param {number} props.power - 카드 파워
 * @param {string} props.faction - 카드 진영 (UI에는 미표시)
 * @param {string} props.effectDesc - 카드 효과 설명 (UI에는 미표시)
 */

const Card = ({ name, imageUrl, cost, power, faction, effectDesc }) => {

   console.log({
    name,
    imageUrl,
    cost,
    power,
    faction,
    effectDesc,
  });

  return (
    <div className="card-container">
      {/* 카드 배경 이미지 */}
      <div
        className="card-background"
         style={{ backgroundImage: `url(${imageUrl})` }} 
      ></div>

      {/* Cost Badge */}
      <div className="stat-badge cost-badge">
        <span>{cost}</span>
      </div>

      {/* Power Badge */}
      <div className="stat-badge power-badge">
        <span>{power}</span>
      </div>

      {/* 카드 이름 */}
      <div className="name-container">
        <span>{name}</span>
      </div>
    </div>
  );
};
export default Card;
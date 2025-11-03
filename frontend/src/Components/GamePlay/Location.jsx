import React from "react"; 
import { useEffect, useRef } from "react";
import "./Location.css";
import powerIcon from "../../assets/locationPower.svg";

/**
 * 게임 카드 정보를 표시하는 컴포넌트입니다.
 * @param {object} props
 * @param {number} props.locationId - 지역 고유 ID (UI 미표시)
 * @param {string} props.name - 지역 이름 (UI 표시)
 * @param {string} props.imageUrl - 지역 이미지 URL (UI 표시)
 * @param {number} props.opponentPower - 상대방 파워 총합 (UI 표시)
 * @param {number} props.myPower - 내 파워 총합 (UI 표시)
 * @param {string} props.effectDesc - 지역 효과 설명 (UI 표시)
 * @param {boolean} props.active - 사용 가능 여부 ? (UI 미표시)
 */

const Location = ({
  locationId,
  name,
  imageUrl,
  opponentPower,
  myPower,
  effectDesc,
  active,
  onLocationClick 
}) => {
  console.log({
    locationId,
    name,
    imageUrl,
    opponentPower,
    myPower,
    effectDesc,
    active,
  });
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      
      // 초기 폰트 스타일
      el.style.fontSize = "24px";
      el.style.whiteSpace = "nowrap";
  
      const tooLong = el.scrollWidth > el.clientWidth; // 내용이 card-name div박스를 넘으면 2줄로 표시 허용

      if (tooLong) {
        el.style.fontSize = "15px";
        el.style.whiteSpace = "normal"; // 줄바꿈 허용
        el.style.wordBreak = "keep-all";  //한글 공백 단위로 줄바꿈
        el.style.lineHeight = "1.1";    // 줄 간격 살짝 조정
    }
    }, [name]);
  return (
    <div className="location-container" onClick={onLocationClick}>
      <img className="location-image" src={imageUrl} alt={name} />

      <div className="opponentPower-container">
        <img src={powerIcon} alt="opponentPower" className="location-icon" />
        <span className="location-icon-text">{opponentPower}</span>
      </div>

      <div className="myPower-container">
        <img src={powerIcon} alt="myPower" className="location-icon" />
        <span className="location-icon-text">{myPower}</span>
      </div>

      <div className="location-name" ref={ref}>{name}</div>
      <div className="location-desc">{effectDesc}</div>
    </div>
  );
};

export default React.memo(Location);
import React from "react"; 
import { useEffect, useRef } from "react";
import "./Location.css";
import powerIcon from "../../assets/locationPower.svg";


const EnlargedLocation = ({ location, onClose }) => {
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
    }, [location.name]);
  return (
    <div className="enlarged-location-container" onClick={onClose}>
      <img className="location-image" src={location.imageUrl} alt={location.name} />

      <div className="opponentPower-container">
        <img src={powerIcon} alt="opponentPower" className="location-icon" />
        <span className="location-icon-text">{location.opponentPower}</span>
      </div>

      <div className="myPower-container">
        <img src={powerIcon} alt="myPower" className="location-icon" />
        <span className="location-icon-text">{location.myPower}</span>
      </div>

      <div className="location-name" ref={ref}>{location.name}</div>
      <div className="location-desc">{location.effectDesc}</div>
    </div>
  );
};

export default React.memo(EnlargedLocation);
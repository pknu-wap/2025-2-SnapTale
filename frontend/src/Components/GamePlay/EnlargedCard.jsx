import './Card.css'; 
import { useEffect, useRef } from "react";
import costIcon from '../../assets/cost.svg';
import powerIcon from '../../assets/power.svg';

const EnlargedCard = ({ card }) => {
  const ref = useRef(null);
  useEffect(() => {
        if(!card) return;
        const el = ref.current;
        if (!el) return;
        
        // 초기 폰트 스타일
        el.style.fontSize = "36px";
        el.style.whiteSpace = "nowrap";
    
        const tooLong = el.scrollWidth > el.clientWidth; // 내용이 card-name div박스를 넘으면 2줄로 표시 허용
  
        if (tooLong) {
          el.style.fontSize = "30px";
          el.style.whiteSpace = "normal"; // 줄바꿈 허용
          el.style.wordBreak = "keep-all";  //한글 공백 단위로 줄바꿈
          el.style.lineHeight = "1.1";    // 줄 간격 살짝 조정
      }
      }, [card]);
  if (!card) return null; // 혹시 card 데이터가 없으면 아무것도 렌더링하지 않음
  const factionClasses = {
    한국: "card-border-korea",
    중국: "card-border-china",
    일본: "card-border-japan"
  };
  const borderClass = factionClasses[card.faction] || "card-border-default";
  return (
    <div className="enlarged-card-container">
      <img
        className={`card-image ${borderClass}`}
        src={card.imageUrl}
        alt={card.name}
      />
      <div className="card-cost-container">
        <img src={costIcon} alt="Cost Icon" className="icon" />
        <span className="icon-text">{card.cost}</span>
      </div>
      <div className="card-power-container">
        <img src={powerIcon} alt="Power Icon" className="icon" />
        <span className="icon-text">{card.power}</span>
      </div>
      <div className="card-name" ref = {ref}>{card.name}</div>
      <div className="card-desc">{card.effectDesc}</div>
    </div>
  );
};

export default EnlargedCard;
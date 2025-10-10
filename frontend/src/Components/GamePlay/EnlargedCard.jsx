import './Card.css'; 
import costIcon from '../../assets/cost.svg';
import powerIcon from '../../assets/power.svg';

const EnlargedCard = ({ card, onClose }) => {
  if (!card) return null; // 혹시 card 데이터가 없으면 아무것도 렌더링하지 않음

   const handleClose = () => {
    onClose?.(); 
  };

  const factionClasses = {
    korea: "card-border-korea",
    china: "card-border-china",
    japan: "card-border-japan"
  };
  const borderClass = factionClasses[card.faction] || "card-border-default";

  return (
    <div className="enlarged-card-container" onClick={handleClose}>
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
      <div className="card-name">{card.name}</div>
      <div className="card-desc">{card.effectDesc}</div>
    </div>
  );
};

export default EnlargedCard;
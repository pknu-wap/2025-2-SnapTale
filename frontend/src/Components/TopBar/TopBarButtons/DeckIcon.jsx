import { useNavigate } from "react-router-dom";
import deckIcon from "../../../assets/DeckIcon.png";
import "./buttonCommon.css";

const DeckIcon = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/deck");
  };

  return (
    <button
      type="button"
      className="common-btn"
      onClick={handleClick}
      aria-label="덱 확인"
    >
      <img src={deckIcon} alt="Deck Icon" />
    </button>
  );
};

export default DeckIcon;
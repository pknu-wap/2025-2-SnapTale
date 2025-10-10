import deckIcon from "../../assets/DeckIcon.png";
import { useNavigate } from 'react-router-dom';

const DeckIcon = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/deck');
  };
  return (
      <img
        src={deckIcon}
        alt="Deck Icon"
        width={80}
        height={80}
        onClick={handleClick}
      />
  );
};
export default DeckIcon;
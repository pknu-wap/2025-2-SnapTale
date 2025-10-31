import smallButton from "../../assets/smallButton.png";
import "./storeButton.css"
import { useNavigate } from 'react-router-dom';
const StoreButton = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(-1); 
    };
    return (
    <div className="deckStore-button-container" onClick={handleClick}>
        <img src={smallButton} alt="DeckStore Button"/>
        <span className="deckStore-button-text">
            저장
        </span>
    </div>
    );
};
export default StoreButton;
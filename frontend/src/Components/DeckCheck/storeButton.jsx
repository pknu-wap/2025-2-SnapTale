import smallButton from "../../assets/smallButton.png";
import "./storeButton.css"
const StoreButton = ({onClick}) => {
    return (
    <div className="deckStore-button-container" onClick={onClick}>
        <img src={smallButton} alt="DeckStore Button"/>
        <span className="deckStore-button-text">
            저장
        </span>
    </div>
    );
};
export default StoreButton;
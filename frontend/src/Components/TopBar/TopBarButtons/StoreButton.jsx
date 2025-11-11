import storeButton from "../../../assets/storeButton.png";
import "./storeButton.css"

const StoreButton = ({onClick}) => {
    return (
    <div className="deckStore-button-container">
        <button type="button"  onClick={onClick}>
            <img src={storeButton} alt="exit" />
        </button>
    </div>
    );
};

export default StoreButton;
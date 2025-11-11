import storeButton from "../../../assets/storeButton.png";
import "./buttonCommon.css";

const StoreButton = ({ onClick }) => {
  return (
    <button
      type="button"
      className="common-btn"
      onClick={onClick}
      aria-label="Open store"
    >
      <img src={storeButton} alt="Store" />
    </button>
  );
};

export default StoreButton;
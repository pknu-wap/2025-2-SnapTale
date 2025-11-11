import exitButton from "../../../assets/exitButton.png";
import "./buttonCommon.css";

const ExitButton = ({ onClick }) => {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className="common-btn exit-btn"
      onClick={handleClick}
      aria-label="Exit"
    >
      <img src={exitButton} alt="Exit" />
    </button>
  );
};

export default ExitButton;
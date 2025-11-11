import exitButton from "../../../assets/exitButton.png";

const ExitButton = ({ onClick }) => {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <button type="button" className="exit-btn" onClick={handleClick}>
      <img src={exitButton} alt="exit" className="exit-icon" />
    </button>
  );
};

export default ExitButton;
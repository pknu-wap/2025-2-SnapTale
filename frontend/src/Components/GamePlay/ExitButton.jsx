const ExitButton = ({ onClick }) => {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <button type="button" className="exit-btn" onClick={handleClick}>
      나가기
    </button>
  );
};

export default ExitButton;
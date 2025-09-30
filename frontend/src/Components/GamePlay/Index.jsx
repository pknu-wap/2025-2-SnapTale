import { useNavigate } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/Soundbar";

const GamePlay = () => {
  const navigate = useNavigate();

  return (
    <div className="gameplay-container">
      <header className="gameplay-header">
        <Soundbar />
        <button 
          className="exit-btn"
          onClick={() => navigate("/home")}>
            나가기
        </button>
      </header>
      <GameLayout />
    </div>
  );
};

export default GamePlay;
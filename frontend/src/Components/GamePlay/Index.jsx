import { useNavigate } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/SoundIcon";

const GamePlay = () => {
  const navigate = useNavigate();

  return (
    <div className="gameplay-container">
      <header className="gameplay-header">
        <Soundbar />
        <div className="gl-oppo-chip">상대 닉네임</div>
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
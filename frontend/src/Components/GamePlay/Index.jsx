import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/SoundIcon";

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();

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
      <GameLayout matchId={matchId} />
    </div>
  );
};

export default GamePlay;
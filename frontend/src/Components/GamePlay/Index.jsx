import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import Soundbar from "../Home/SoundIcon";
import { useUser } from "../../contexts/UserContext";

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { user } = useUser();
  const opponentName = user.enemyPlayer ? user.enemyPlayer.nickname : "상대방";
  console.log("GamePlay opponentName:", opponentName);
  return (
    <div className="gameplay-container">
      <header className="gameplay-header">
        <Soundbar />
        <div className="gl-oppo-chip">{opponentName}</div>
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
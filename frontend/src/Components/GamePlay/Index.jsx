import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import TopBar from "../Layout/TopBar";
import { useUser } from "../../contexts/UserContext";

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { user } = useUser();
  const opponentName = user.enemyPlayer ? user.enemyPlayer.nickname : "상대방";
  console.log("GamePlay opponentName:", opponentName);
  return (
    <div className="gameplay-container">
      <TopBar screenType="gameplay" onExit={() => navigate("/home")} />
      <header className="gameplay-header">
        <div className="gl-oppo-chip">{opponentName}</div>
      </header>
      <GameLayout matchId={matchId} />
    </div>
  );
};

export default GamePlay;
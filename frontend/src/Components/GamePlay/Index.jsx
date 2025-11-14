import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import TopBar from "../TopBar/TopBar";
import { useUser } from "../../contexts/UserContext";

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { user } = useUser();
  const opponentName = user.enemyPlayer ? user.enemyPlayer.nickname : "상대방";
  console.log("GamePlay opponentName:", opponentName);
  return (
    <>
      <TopBar screenType="gameplay" onExit={() => navigate("/home")} />
      <div className="gameplay-container">
        <header className="gameplay-header">
        </header>
        <GameLayout matchId={matchId} />
      </div>
    </>
  );
};

export default GamePlay;
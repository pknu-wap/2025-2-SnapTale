import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "./GameLayout";
import TopBar from "../TopBar/TopBar";
import { useUser } from "../../contexts/UserContext";
import { useWebSocket } from "../../contexts/WebSocketContext";

const GamePlay = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { user } = useUser();
  const { sendMessage } = useWebSocket();
  const opponentName = user.enemyPlayer ? user.enemyPlayer.nickname : "상대방";
  console.log("GamePlay opponentName:", opponentName);

  const handleExit = () => {
    if (matchId && user?.guestId) {
      try {
        // WebSocket으로 나가기 메시지 전송
        sendMessage(`/app/match/${matchId}/leave`, {
          matchId: parseInt(matchId),
          userId: user.guestId,
          reason: "사용자가 게임을 나갔습니다."
        });
        console.log("게임 나가기 메시지 전송: matchId=", matchId);
      } catch (error) {
        console.error("게임 나가기 메시지 전송 실패:", error);
        // 메시지 전송 실패해도 홈으로 이동
      }
    }
    // 메시지 전송 후 홈으로 이동
    navigate("/home");
  };

  return (
    <>
      <TopBar screenType="gameplay" onExit={handleExit} />
      <div className="gameplay-container">
        <header className="gameplay-header">
        </header>
        <GameLayout matchId={matchId} />
      </div>
    </>
  );
};

export default GamePlay;
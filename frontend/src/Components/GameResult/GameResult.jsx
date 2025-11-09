import TopBar from "../TopBar/TopBar";
import "./GameResult.css";

const GameResult = () => {
  return (
    <>
    <TopBar screenType="result" />
    <div className="game-result-container">
      
      <div className="game-result-body">
        <h1>게임 결과 화면</h1>
      </div>
    </div>
    </>
  );
};

export default GameResult;
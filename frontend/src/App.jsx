import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Init } from "./Components/Init";
import { Home } from "./Components/Home";
import { GamePlay } from "./Components/GamePlay";
import { GameResult } from "./Components/GameResult";

function App() {
  return (
    <>
    <Router>
      <Routes>
        {/* 초기 화면 */}
        <Route path="/" element={<Init />} />
        {/* 메인 홈 화면*/}
        <Route path="/home" element={<Home />} />
        {/* 게임 플레이 화면 */}
        <Route path="/gameplay" element={<GamePlay />} />
        {/* 게임 결과 확인 화면*/}
        <Route path="/gameresult" element={<GameResult />} />
      </Routes>
    </Router>
    </>
  )
}

export default App

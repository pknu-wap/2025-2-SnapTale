import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  Init  from "./Components/Init/Init";
import  Home  from "./Components/Home/Home";
import  DeckCheck from "./Components/DeckCheck/DeckCheck";
import  GameLoading from "./Components/Home/GameLoading";
import  GamePlay  from "./Components/GamePlay/Index";
import  GameResult  from "./Components/GameResult";

function App() {
  return (
    <div className='app-bg'>
    <Router>
      <Routes>
        {/* 초기 화면 */}
        <Route path="/" element={<Init />} />
        {/* 메인 홈 화면*/}
        <Route path="/home" element={<Home />} />
        {/* 덱 확인 화면*/}
        <Route path="/deck" element={<DeckCheck />} />
        {/* 게임 로딩 화면*/}
        <Route path="/gameloading" element={<GameLoading />} />
        {/* 게임 플레이 화면 */}
        <Route path="/gameplay/:matchId" element={<GamePlay />} />
        {/* 게임 결과 확인 화면*/}
        <Route path="/gameresult" element={<GameResult />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App;
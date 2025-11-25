import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import  Init  from "./Components/Init/Init";
import  Home  from "./Components/Home/Home";
import Tutorial from "./Components/Tutorial/Tutorial";
import  DeckCheck from "./Components/DeckCheck/DeckCheck";
import  GameLoading from "./Components/Home/GameLoading";
import  GamePlay  from "./Components/GamePlay/Index";
import  GameResult  from "./Components/GameResult/GameResult";
import { WebSocketLayout } from "./contexts/WebSocketContext.jsx";

function AppShell() {
  const { pathname } = useLocation();
  const isGameplay = pathname.startsWith("/gameplay");

  return (
    <div className="app-background">
      <div className={`app-bg-image ${isGameplay ? "bg-gameplay" : "bg-default"}`}>
        <Routes>
          {/* 초기 화면 */}
            <Route path="/" element={<Init />} />
            {/* 메인 홈 화면 */}
            <Route path="/home" element={<Home />} />
            {/* 튜토리얼 화면 */}
            <Route path="/tutorial" element={<Tutorial />} />
            {/* 덱 확인 화면 */}
            <Route path="/deck" element={<DeckCheck />} />
            {/* 게임 로딩 화면 */}
            <Route path="/gameloading" element={<GameLoading />} />
            {/* 게임 플레이 화면 (matchId 파라미터) */}
            <Route element={<WebSocketLayout />}>
            <Route path="/gameplay/:matchId" element={<GamePlay />} />
            </Route>
            {/* 게임 결과 확인 화면 */}
            <Route path="/gameresult" element={<GameResult />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
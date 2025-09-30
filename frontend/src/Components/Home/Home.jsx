import Button from "./Button"
import Profile from "./Profile";
import Soundbar from "./Soundbar";
import RDModal from "./RDModal";
import PWModal from "./PWModal";
import { useState } from "react";
import './Home.css'

const Home = () => {
  const [openPWModal, setOpenPWModal] = useState(false);
  const [openRDModal, setOpenRDModal] = useState(false);
  const [matchCode, setMatchCode] = useState(""); // 매치코드 값 저장
  return (
    <div className="home-container">
      
      {/* 상단 메뉴 (사운드바, 프로필) */}
      <header className="top-menu">
        <Soundbar />
        <Profile />
      </header>

      {/* 메인 버튼 영역 */}
      <main className="matching-buttons">
        <div>
          <Button text={"랜덤 매치"} 
            onClick={() => {
              setMatchCode("");
              setOpenRDModal(true);
            }}
          />
        </div>
        {openRDModal && <RDModal setOpenRDModal={setOpenRDModal} matchCode={matchCode}/>} {/* state가 true면 전투 대기중 모달창 표시 */}
        <div>
          <Button text={"친선전"} 
            onClick={() => {
            setOpenPWModal(true);
          }}
          />
          {openPWModal && <PWModal 
          setOpenPWModal={setOpenPWModal}
          setOpenRDModal={setOpenRDModal}
          setMatchCode={setMatchCode}
          />} {/* state가 true면 패스워드 입력 모달창 표시 */}
        </div>
        <Button text={"튜토리얼"} />
      </main>
    </div>
  );
};
export default Home;
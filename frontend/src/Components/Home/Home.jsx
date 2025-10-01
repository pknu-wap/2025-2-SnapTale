import './Home.css'
import Button from "./Button"
import Profile from "./Profile";
import SoundIcon from "./SoundIcon";
import RDModal from "./RDModal";
import PWModal from "./PWModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [openPWModal, setOpenPWModal] = useState(false);
  const [openRDModal, setOpenRDModal] = useState(false);
  const [matchCode, setMatchCode] = useState(""); // 매치코드 값 저장
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      {/* 상단 메뉴 (사운드바, 프로필) */}
      <header className="top-menu">
        <SoundIcon />
        <Profile />
      </header>

      {/* 메인 버튼 영역 */}
      <main className= "matching-buttons">
          <Button 
            text={"랜덤 매치"} 
            onClick={() => {
              setMatchCode("");
              setOpenRDModal(true);
            }}
            disabled={openRDModal || openPWModal} 
          />
          <Button 
            text={"친선전"} 
            onClick={() => {
            setOpenPWModal(true);
            }}
            disabled={openRDModal || openPWModal} 
          />
          <Button 
            text={"튜토리얼"} 
            disabled={openRDModal || openPWModal} 
          />

        {openRDModal && 
          <RDModal 
            setOpenRDModal={setOpenRDModal} 
            matchCode={matchCode} />
        }
        {/* state가 true면 전투 준비 중 모달창 표시 */}

        {openPWModal && 
          <PWModal 
            setOpenPWModal={setOpenPWModal}
            setOpenRDModal={setOpenRDModal}
            setMatchCode={setMatchCode} />} 
        {/* state가 true면 패스워드 입력 모달창 표시 */}
        
        <button
          onClick={() => navigate('/gameplay')}>
        </button>
      </main>
    </div>
  );
};
export default Home;
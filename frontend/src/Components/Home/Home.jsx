import './Home.css'
import Button from "./Button"
import DeckIcon from "./DeckIcon";
import SoundIcon from "./SoundIcon";
import RDModal from "./RDModal";
import PWModal from "./PWModal";
import { useState } from "react";
import { createMatch, joinMatch } from "./api/match";
import { useUser } from "../../contexts/UserContext";


const Home = () => {
  const [openPWModal, setOpenPWModal] = useState(false);
  const [openRDModal, setOpenRDModal] = useState(false);
  const [matchCode, setMatchCode] = useState(""); // 매치코드 값 저장
  const { user } = useUser();

  // 랜덤 매치 버튼 클릭 핸들러
  const handleRandomMatch = async () => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      // 매치 생성
      const matchData = await createMatch("QUEUED", 0);
      console.log("랜덤 매치 생성 완료:", matchData);
      
      // 생성된 매치에 참가
      const joinResponse = await joinMatch(matchData.matchId, user.guestId, user.nickname);
      console.log("랜덤 매치 참가 완료:", joinResponse);
      
      // 매치 코드 설정하고 모달 열기
      setMatchCode("");
      setOpenRDModal(true);
    } catch (error) {
      console.error("랜덤 매치 실패:", error);
      alert("매치 생성에 실패했습니다.");
    }
  };
  return (
    <div className="home-container">
      
      {/* 상단 메뉴 (사운드바, 프로필) */}
      <header className="top-menu">
        <SoundIcon />
        <DeckIcon />
      </header>

      {/* 메인 버튼 영역 */}
      <main className= "matching-buttons">
          <Button 
            text={"랜덤 매치"} 
            onClick={handleRandomMatch}
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
      </main>
    </div>
  );
};
export default Home;
import './Home.css'
import Button from "./Button"
import DeckIcon from "./DeckIcon";
import SoundIcon from "./SoundIcon";
import RDModal from "./RDModal";
import PWModal from "./PWModal";
import { useState } from "react";
import { joinMatch } from "./api/match";
import { useUser } from "../../contexts/UserContext";


const Home = () => {
  const [openPWModal, setOpenPWModal] = useState(false);
  const [openRDModal, setOpenRDModal] = useState(false);
  const [matchCode, setMatchCode] = useState(""); // 매치코드 값 저장
  const [currentMatchId, setCurrentMatchId] = useState(null); // 랜덤 매치의 matchId 저장
  const { user } = useUser();

  // 랜덤 매치 버튼 클릭 핸들러
  const handleRandomMatch = async () => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      //랜덤 매치에서 createMatch 호출 안 하고 백엔드에서 알아서 처리함.

      // 바로 참가 (백엔드가 가장 낮은 대기 매치를 선택/생성)
      const joinResponse = await joinMatch(0, user.guestId, user.nickname);
      console.log("랜덤 매치 참가 완료:", joinResponse);
      
      // 응답에서 matchId 추출 (parseJsonResponse가 result를 반환할 수 있으므로 둘 다 확인)
      const matchId = joinResponse.matchId || joinResponse.result?.matchId;
      if (matchId) {
        setCurrentMatchId(matchId);
        setMatchCode(""); // 랜덤 매치는 matchCode 없음
        setOpenRDModal(true);
      } else {
        console.error("응답 구조:", joinResponse);
        throw new Error("매치 ID를 받지 못했습니다.");
      }
    } catch (error) {
      console.error("랜덤 매치 실패:", error);
      alert("매치 참가에 실패했습니다.");
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
            matchCode={matchCode}
            currentMatchId={currentMatchId} />
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
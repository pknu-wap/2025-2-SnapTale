import './Home.css'
import Button from "./Button"
import TopBar from '../TopBar/TopBar';
import RDModal from "./RDModal";
import FriendlyMatchModal from "./FriendlyMatchModal";
import CreateMatchModal from "./CreateMatchModal";
import JoinMatchModal from "./JoinMatchModal";
import DCModal from './DeckCheckModal'; 
import { useState, useEffect } from "react"; 
import { joinMatch, createMatch } from "./api/match";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [openRDModal, setOpenRDModal] = useState(false);
  const [openFriendlyModal, setOpenFriendlyModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false); //덱 설정 정보에 따라 DeckCheck 모달을 보여줄 지 여부 결정
  const [matchCode, setMatchCode] = useState(""); // 매치코드 값 저장
  const [currentMatchId, setCurrentMatchId] = useState(null); // 매치의 matchId 저장
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
        return;
    }
    else{
      console.log("User selectedDeckPresetId:", user.selectedDeckPresetId);
       if (!user.selectedDeckPresetId) { // 예: 덱 ID가 없으면
        setShowDeckModal(true); // 덱 체크 모달 보이기
      } else {
        setShowDeckModal(false); // 덱이 있으면 모달 숨기기
      }
    }
  }, [user]); // user 객체가 갱신될 때마다 실행

  // 랜덤 매치 버튼 클릭 핸들러
  const handleRandomMatch = async () => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      //랜덤 매치에서 createMatch 호출 안 하고 백엔드에서 알아서 처리함.

      // 바로 참가 (백엔드가 가장 낮은 대기 매치를 선택/생성)
      const joinResponse = await joinMatch(0, user.guestId, user.nickname, user.selectedDeckPresetId);
      console.log("랜덤 매치 참가 완료:", joinResponse);
      
      // 응답에서 matchId 추출 (parseJsonResponse가 result를 반환할 수 있으므로 둘 다 확인)
      const matchId = joinResponse.matchId || joinResponse.result?.matchId;
      
      const pid =
        joinResponse.participantId ??
        joinResponse.result?.participantId ??
        joinResponse.participant?.participantId;
      if (pid) updateUser({ participantId: pid });

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

  // 친선전 매치 생성 핸들러
  const handleCreateFriendlyMatch = async () => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      // 1. 새로운 매치 생성 (QUEUED 상태, FRIENDLY 타입)
      console.log("친선전 매치 생성 시도 - userId:", user.guestId);
      const createResponse = await createMatch("QUEUED", "FRIENDLY", 0);
      console.log("친선전 매치 생성 완료 - 전체 응답:", createResponse);

      const matchId = createResponse.matchId || createResponse.result?.matchId;
      console.log("생성된 matchId:", matchId);
      
      if (!matchId) {
        console.error("응답 구조:", createResponse);
        throw new Error("매치 ID를 받지 못했습니다.");
      }

      // 2. 생성한 매치에 자신이 참가
      console.log("생성한 매치 참가 시도 - matchId:", matchId, "userId:", user.guestId);
      const joinResponse = await joinMatch(matchId, user.guestId, user.nickname, user.selectedDeckPresetId);
      console.log("친선전 매치 참가 완료 - 응답:", joinResponse);

      const pid =
        joinResponse.participantId ??
        joinResponse.result?.participantId ??
        joinResponse.participant?.participantId;
      if (pid) updateUser({ participantId: pid });

      // 3. matchId 설정하고 CreateModal 열기
      setCurrentMatchId(matchId);
      setMatchCode(matchId.toString());
      setOpenFriendlyModal(false);
      setOpenCreateModal(true);
    } catch (error) {
      console.error("친선전 매치 생성 실패:", error);
      alert("매치 생성에 실패했습니다.");
    }
  };

  // 친선전 매치 참가 핸들러
  const handleJoinFriendlyMatch = async (matchId) => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const matchIdNum = parseInt(matchId);
      if (isNaN(matchIdNum)) {
        alert("올바른 매치 ID를 입력해주세요.");
        return;
      }

      console.log("친선전 매치 참가 시도: 입력 matchId =", matchIdNum, "userId =", user.guestId);

      // 입력받은 매치 ID로 참가
      const joinResponse = await joinMatch(matchIdNum, user.guestId, user.nickname, user.selectedDeckPresetId);
      console.log("친선전 매치 참가 완료 - 전체 응답:", joinResponse);

      const pid =
        joinResponse.participantId ??
        joinResponse.result?.participantId ??
        joinResponse.participant?.participantId;
      if (pid) updateUser({ participantId: pid });

      // 응답에서 matchId 확인
      const responseMatchId = joinResponse.matchId || joinResponse.result?.matchId;
      console.log("응답에서 추출한 matchId:", responseMatchId);
      
      if (responseMatchId) {
        console.log("매치 참가 성공 - 설정할 matchId:", responseMatchId);
        setCurrentMatchId(responseMatchId);
        setMatchCode(matchId);
        setOpenJoinModal(false);
        setOpenRDModal(true);
      } else {
        console.error("응답 구조:", joinResponse);
        throw new Error("매치 참가에 실패했습니다.");
      }
    } catch (error) {
      console.error("친선전 매치 참가 실패:", error);
      alert("매치 참가에 실패했습니다. 매치 ID를 확인해주세요.");
    }
  };

  return (
    <>
      <TopBar screenType="home" />
      <div className="home-container">

        {/* 메인 버튼 영역 */}
        <main className= "matching-buttons">
            <Button 
              text={"랜덤 매치"} 
              onClick={handleRandomMatch}
              disabled={showDeckModal || openRDModal || openFriendlyModal || openCreateModal || openJoinModal} 
            />
            <Button 
              text={"친선전"} 
              onClick={() => {
                if (!user) {
                  alert("로그인이 필요합니다.");
                  return;
                }
                setOpenFriendlyModal(true);
              }}
              disabled={showDeckModal || openRDModal || openFriendlyModal || openCreateModal || openJoinModal} 
            />
            <Button 
              text={"튜토리얼"} 
              onClick={() => navigate("/tutorial")}
              disabled={showDeckModal || openRDModal || openFriendlyModal || openCreateModal || openJoinModal} 
            />
          {showDeckModal && <DCModal />}

          {openRDModal && 
            <RDModal 
              setOpenRDModal={setOpenRDModal} 
              matchCode={matchCode}
              currentMatchId={currentMatchId} />
          }

          {openFriendlyModal && 
            <FriendlyMatchModal 
              setOpenFriendlyModal={setOpenFriendlyModal}
              setOpenJoinModal={setOpenJoinModal}
              onCreateMatch={handleCreateFriendlyMatch} />
          }

          {openCreateModal && 
            <CreateMatchModal 
              setOpenCreateModal={setOpenCreateModal}
              matchId={currentMatchId} />
          }

          {openJoinModal && 
            <JoinMatchModal 
              setOpenJoinModal={setOpenJoinModal}
              onJoinMatch={handleJoinFriendlyMatch} />
          }
        </main>
      </div>
    </>
  );
};
export default Home;
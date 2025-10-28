import './Modal.css'
import MatchCode from './MatchCode';
import profile1 from '../../assets/userProfile.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { joinMatch, getMatch, createMatch } from './api/match';

{/* 전투 준비 중 모달창 */}
const RDModal = ({setOpenRDModal, matchCode}) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [isMatched, setIsMatched] = useState(false);
    const [currentMatchId, setCurrentMatchId] = useState(null);

     const [enemyPlayer, setEnemyPlayer] = useState({
        userName: "",
        profileImage: ""
    });

    // 매치 참가 또는 생성 처리
    useEffect(() => {
        if (!user) return;

        const handleMatching = async () => {
            try {
                if (matchCode) {
                    // 친선전: 패스워드로 매치 조인
                    const matchId = parseInt(matchCode);
                    if (isNaN(matchId)) {
                        alert("잘못된 매치 코드입니다.");
                        setOpenRDModal(false);
                        return;
                    }

                    const response = await joinMatch(matchId, user.guestId, user.nickname);
                    console.log("매치 참가 성공:", response);
                    setCurrentMatchId(matchId);
                } else {
                    // 랜덤 매칭: 새 매치 생성
                    const matchData = await createMatch("QUEUED", 0);
                    console.log("매치 생성 성공:", matchData);
                    setCurrentMatchId(matchData.matchId);
                    
                    // 생성된 매치에 참가
                    await joinMatch(matchData.matchId, user.guestId, user.nickname);
                    console.log("생성된 매치에 참가 완료");
                }
            } catch (error) {
                console.error("매치 처리 실패:", error);
                alert("매치 참가에 실패했습니다.");
                setOpenRDModal(false);
            }
        };

        handleMatching();
    }, [matchCode, user, setOpenRDModal]);

    // 매치 상태 폴링 (상대방 입장 확인)
    useEffect(() => {
        if (!currentMatchId) return;

        const intervalId = setInterval(async () => {
            try {
                const matchData = await getMatch(currentMatchId);
                console.log("매치 상태:", matchData);

                // participants가 2명이면 매칭 완료
                if (matchData && matchData.participants && matchData.participants.length >= 2) {
                    setIsMatched(true);
                    clearInterval(intervalId);

                    // 상대방 정보 찾기
                    const otherParticipant = matchData.participants.find(
                        p => p.guestId !== user.guestId
                    );
                    if (otherParticipant) {
                        setEnemyPlayer({
                            userName: otherParticipant.nickname || "상대방",
                            profileImage: profile1
                        });
                    }
                }
            } catch (error) {
                console.error("매치 상태 조회 실패:", error);
            }
        }, 1000); // 1초마다 체크

        return () => clearInterval(intervalId);
    }, [currentMatchId, user]);

    useEffect(() => {
        if (isMatched) {
            navigate("/gameloading", {
                state: {
                    userName1: user?.nickname || "내닉네임",
                    profileImage1: profile1,
                    userName2: enemyPlayer.userName,
                    profileImage2: enemyPlayer.profileImage,
                    matchId: currentMatchId
                }
            });
        }
    }, [isMatched, navigate, enemyPlayer, user, currentMatchId]);

    return (
        <div className = "Overlay">
            <button className = "cancelIcon"
                onClick={() => {
                    setOpenRDModal(false); // 클릭하면 모달창 닫기
                }}></button>
            <div className = "modal-main">
                {!isMatched ? (
                    <>
                        {matchCode && <MatchCode matchCode={matchCode} />}
                        <span className="modal-text">전투 준비 중...</span>
                    </>
                ) : null}
            </div>
        </div>
    );
};
export default RDModal;
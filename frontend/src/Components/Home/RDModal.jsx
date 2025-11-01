import './Modal.css'
import MatchCode from './MatchCode';
import profile1 from '../../assets/userProfile.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { joinMatch, getMatch, deleteMatch } from './api/match';

{/* 전투 준비 중 모달창 */}
const RDModal = ({setOpenRDModal, matchCode, currentMatchId: initialMatchId}) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [isMatched, setIsMatched] = useState(false);
    const [currentMatchId, setCurrentMatchId] = useState(initialMatchId);

    const [enemyPlayer, setEnemyPlayer] = useState({
        userName: "",
        profileImage: ""
    });

    // 매치 참가 처리
    useEffect(() => {
        if (!user) return;

        const handleMatching = async () => {
            try {
                // currentMatchId가 이미 있으면 Home에서 joinMatch를 호출했으므로 폴링만 시작
                if (currentMatchId) {
                    console.log("이미 매치 참가됨, matchId:", currentMatchId);
                    return;
                }

                // matchCode가 있고 currentMatchId가 없는 경우에만 joinMatch 호출
                // (PWModal을 통한 구 방식 - 현재는 사용하지 않음)
                if (matchCode) {
                    const matchId = parseInt(matchCode);
                    if (isNaN(matchId)) {
                        alert("잘못된 매치 코드입니다.");
                        setOpenRDModal(false);
                        return;
                    }

                    const response = await joinMatch(matchId, user.guestId, user.nickname);
                    console.log("친선전 매치 참가 성공:", response);
                    setCurrentMatchId(matchId);
                }
            } catch (error) {
                console.error("매치 처리 실패:", error);
                alert("매치 참가에 실패했습니다.");
                setOpenRDModal(false);
            }
        };

        handleMatching();
    }, [matchCode, currentMatchId, user, setOpenRDModal]);

    // 매치 상태 폴링 (상대방 입장 확인)
    useEffect(() => {
        if (!currentMatchId) return;

        const intervalId = setInterval(async () => {
            try {
                const matchData = await getMatch(currentMatchId);
                console.log("매치 상태:", matchData);

                // 상태 기반 매칭 완료 처리 (권장)
                if (matchData && (matchData.status === "MATCHED" || matchData.status === "PLAYING")) {
                    // 상대 정보가 응답에 포함되어 있으면 설정 (선택적)
                    if (matchData.participants && matchData.participants.length >= 2) {
                        const other = matchData.participants.find(p => p.guestId !== user.guestId);
                        if (other) {
                            setEnemyPlayer({
                                userName: other.nickname || "상대방",
                                profileImage: other.profileImage || profile1
                            });
                        }
                    }
                    setIsMatched(true);
                    clearInterval(intervalId);
                    return;
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
                onClick={async () => {
                    try {
                        const targetId = currentMatchId || (matchCode ? parseInt(matchCode) : null);
                        if (targetId) {
                            await deleteMatch(targetId);
                        }
                    } catch (e) {
                        console.error('매치 삭제 실패:', e);
                    } finally {
                        setOpenRDModal(false); // 클릭하면 모달창 닫기
                    }
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
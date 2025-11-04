import './Modal.css'
import MatchCode from './MatchCode';
import profile1 from '../../assets/userProfile.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getMatch, deleteMatch } from './api/match';

{/* 매치 생성 후 대기 모달창 */}
const CreateMatchModal = ({ setOpenCreateModal, matchId }) => {
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const [isMatched, setIsMatched] = useState(false);
    const [enemyPlayer, setEnemyPlayer] = useState({
        userName: "",
        profileImage: ""
    });

    // 매치 상태 폴링 (상대방 입장 확인)
    useEffect(() => {
        if (!matchId) return;

        const intervalId = setInterval(async () => {
            try {
                const matchData = await getMatch(matchId);
                console.log("매치 상태:", matchData);

                // 상태 기반 매칭 완료 처리
                if (matchData && (matchData.status === "MATCHED" || matchData.status === "PLAYING")) {
                    // 상대 정보가 응답에 포함되어 있으면 설정
                    if (matchData.participants && matchData.participants.length >= 2) {
                        const other = matchData.participants.find(p => p.guestId !== user?.guestId);
                        const mine = matchData.participants.find(p => String(p.guestId) === String(user?.guestId));
                        if (mine?.participantId) updateUser({ participantId: mine.participantId });
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
    }, [matchId, user]);

    // 매칭 완료 시 게임 로딩 페이지로 이동
    useEffect(() => {
        if (isMatched) {
            navigate("/gameloading", {
                state: {
                    userName1: user?.nickname || "내닉네임",
                    profileImage1: profile1,
                    userName2: enemyPlayer.userName,
                    profileImage2: enemyPlayer.profileImage,
                    matchId: matchId
                }
            });
        }
    }, [isMatched, navigate, enemyPlayer, user, matchId]);

    return (
        <div className="Overlay">
            <button className="cancelIcon"
                onClick={async () => {
                    try {
                        if (matchId) {
                            await deleteMatch(matchId);
                        }
                    } catch (e) {
                        console.error('매치 삭제 실패:', e);
                    } finally {
                        setOpenCreateModal(false);
                    }
                }}>
            </button>
            <div className="modal-main">
                {matchId && <MatchCode matchCode={matchId.toString()} />}
                <span className="modal-text">도전자를 기다리는 중...</span>
            </div>
        </div>
    );
};

export default CreateMatchModal;


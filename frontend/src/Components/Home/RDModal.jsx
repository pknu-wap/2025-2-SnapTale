import './Modal.css'
import MatchCode from './MatchCode';
import profile1 from '../../assets/userProfile.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
{/* 전투 준비 중 모달창 */}
const RDModal = ({setOpenRDModal, matchCode}) => {
    const navigate = useNavigate(); 
    //내 닉네임과 프로필을 받아오는 로직 구현 필요
    const [isMatched, setIsMatched] = useState(false);

     const [enemyPlayer, setEnemyPlayer] = useState({
        userName: "",
        profileImage: ""
    });

     useEffect(() => {
        // 서버에서 매칭된 상대 유저 정보 받는 로직 (지금은 2초 뒤 설정)
        const timer = setTimeout(() => {
            setEnemyPlayer({
                userName: "상대닉네임",
                profileImage: profile1
            });
            setIsMatched(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isMatched) {
            navigate("/gameloading", {
                state: {
                    userName1: "내닉네임",
                    profileImage1: profile1,
                    userName2: enemyPlayer.userName,
                    profileImage2: enemyPlayer.profileImage
                }
            });
        }
    }, [isMatched, navigate, enemyPlayer]);

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
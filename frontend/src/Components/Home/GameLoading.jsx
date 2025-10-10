import './Modal.css'
import UserProfile from './UserProfile';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from 'react';

//게임 로딩 애니메이션 추가 예정
const GameLoading = () => {
  const { state } = useLocation(); 
  const { userName1, profileImage1, userName2, profileImage2 } = state;
  const navigate = useNavigate();

  useEffect(() => {
    // 2초 뒤 /gameplay로 이동
    const timer = setTimeout(() => {
      navigate('/gameplay');
    }, 2000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="Overlay">
        <div className="modal-main">
            <UserProfile userName={userName1} profileImage={profileImage1} />
            <span className="modal-text">VS</span>
            <UserProfile userName={userName2} profileImage={profileImage2} />
        </div>
        <div className="extra-text">
            <span className="explain-text">입장 준비 중...</span>
        </div>
    </div>
    
  );
};
export default GameLoading;
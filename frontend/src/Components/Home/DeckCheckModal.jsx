import './Modal.css'
import { useNavigate } from 'react-router-dom';
{/* 덱체크 모달창 */} 
const DCModal = () => {
//덱 설정이 안된 유저에게 덱 설정 요구
const navigate = useNavigate();
  // 모달 창의 어떤 영역을 클릭하면 (Overlay) 덱 확인 페이지로 이동
  const handleClick = () => {
    navigate('/deck');
  };
    return (
        <div className = "Overlay" onClick={handleClick}>
            <div className = "modal-main"> 
                <span className = "modal-text-deckCheck">덱을 선택하고<br />전투를 준비하세요!</span> 
            </div>
        </div>
    );
};
export default DCModal;
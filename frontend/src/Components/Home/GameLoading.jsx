import './Modal.css'
import UserProfile from './UserProfile';
import { useLocation } from "react-router-dom";
const GameLoading = () => {
  const { state } = useLocation(); 
  const { userName1, profileImage1, userName2, profileImage2 } = state;

  return (
    <div className="Overlay">
      <div className="modal-main">
        <UserProfile userName={userName1} profileImage={profileImage1} />
        <span className="modal-text">VS</span>
        <UserProfile userName={userName2} profileImage={profileImage2} />
      </div>
    </div>
  );
};
export default GameLoading;
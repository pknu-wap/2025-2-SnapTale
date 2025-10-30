import './Modal.css'
import { useState } from "react";

{/* 매치 참가 모달창 - 매치 ID 입력 */}
const JoinMatchModal = ({ setOpenJoinModal, onJoinMatch }) => {
    const [matchId, setMatchId] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const handleConfirm = () => {
        if (matchId === "") {
            setShowAlert(true);
            return;
        }
        setShowAlert(false);
        
        // 부모 컴포넌트로 매치 ID 전달
        onJoinMatch(matchId);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    return (
        <div className="Overlay">
            <button className="cancelIcon"
                onClick={() => {
                    setOpenJoinModal(false);
                }}>
            </button>
            <div className="modal-title"> 
                <span className="modal-text">매치 ID</span> 
            </div>
            <div className="input-container"> 
                <input 
                    className="modal-input match-id-input"
                    maxLength={10}
                    type="number"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="매치 ID를 입력하세요"
                />
            </div>
            <div className="modal-footer">
                <button className="cancel"
                    onClick={() => {
                        setOpenJoinModal(false);
                    }}>
                    취소
                </button>
                <button className="accept"
                    onClick={handleConfirm}>
                    확인
                </button>
            </div>
            {showAlert && (
                <div className="extra-text">
                    <span className="alert-text">매치 ID를 입력해주세요.</span>
                </div>
            )}
        </div>
    );
};

export default JoinMatchModal;


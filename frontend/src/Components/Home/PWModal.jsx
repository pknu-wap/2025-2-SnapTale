import './Modal.css'
import { useState } from "react";
{/* 친선전 모달창 */}
const PWModal = ({setOpenPWModal, setOpenRDModal, setMatchCode }) => {
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const handleConfirm = () => {
    if (password === "") {
        setShowAlert(true); // 비어있으면 메시지 표시
        return;
    }
    setShowAlert(false);
    setMatchCode(password);
    setOpenPWModal(false);
    setOpenRDModal(true);
    };
//그 먼저 방 생성 or 참가 선택지가 있어야 하는데 이건 없어서 새로 만들고 이건 일단 둘게요!
    return (
        <div className = "Overlay">
            <div className = "modal-title"> 
                <span className = "modal-text">방 패스워드</span> 
            </div>
            <div className = "input-container"> 
                <input className = "modal-input"
                maxLength={8} /* 8글자 입력 제한 */
                value={password}
                onChange={(e) => setPassword(e.target.value)} //입력 받은 값 상태로 저장
                />
            </div>
            <div className = "modal-footer">
                <button className = "cancel"
                    onClick={() => {
                        setOpenPWModal(false); // 클릭하면 모달창 닫기
                    }}>취소</button>
                <button className = "accept"
                    onClick= {handleConfirm}
                    >확인</button>
            </div>
            {showAlert && (
                <div className="extra-text">
                    <span className="alert-text">패스워드를 입력해주세요.</span>
                </div>
            )}
        </div>
    );
};
export default PWModal;
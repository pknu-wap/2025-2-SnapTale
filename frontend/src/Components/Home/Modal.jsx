import './Modal.css'
{/* 친선전 모달창 */}
const Modal = ({setOpenModal}) => {
    return (
        <div className = "Overlay">
            <div className = "modal-title"> 
                <span className = "modal-text">방 패스워드</span> 
            </div>
            <div className = "input-container"> 
                <input className = "modal-input"></input> 
            </div>
            <div className = "modal-footer">
                <button 
                className = "cancel"
                onClick={() => {
                    setOpenModal(false); // 클릭하면 모달창 닫기
                }}>
                    취소
                </button>
                <button className = "accept">확인</button>
            </div>
        </div>
    );
};
export default Modal;
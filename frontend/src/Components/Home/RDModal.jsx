import './Modal.css'
{/* 전투준비중 모달창 */}
const Modal = ({setOpenRDModal, matchCode }) => {
    return (
        <div className = "Overlay">
            <button className = "cancelIcon"
                onClick={() => {
                    setOpenRDModal(false); // 클릭하면 모달창 닫기
                }}></button>
            <div className = "modal-main">
                {matchCode && (
                    <div className="modal-code">
                        매치 코드: {matchCode}
                    </div>
                )}
                <span className = "modal-text">전투 준비 중...</span> 
            </div>
        </div>
    );
};
export default Modal;
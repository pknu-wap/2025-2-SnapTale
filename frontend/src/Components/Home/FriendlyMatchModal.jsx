import './Modal.css'

{/* 친선전 선택 모달창 - 매치 만들기 / 매치 참가 */}
const FriendlyMatchModal = ({ setOpenFriendlyModal, setOpenJoinModal, onCreateMatch }) => {
    
    const handleCreateMatch = () => {
        // 부모 컴포넌트의 매치 생성 핸들러 호출
        if (onCreateMatch) {
            onCreateMatch();
        }
    };

    const handleJoinMatch = () => {
        setOpenFriendlyModal(false);
        setOpenJoinModal(true);
    };

    return (
        <div className="Overlay">
            <button className="cancelIcon"
                onClick={() => {
                    setOpenFriendlyModal(false);
                }}>
            </button>
            <div className="modal-title"> 
                <span className="modal-text">친선전</span> 
            </div>
            <div className="modal-footer">
                <button className="cancel"
                    onClick={handleCreateMatch}>
                    매치 만들기
                </button>
                <button className="accept"
                    onClick={handleJoinMatch}>
                    매치 참가
                </button>
            </div>
        </div>
    );
};

export default FriendlyMatchModal;


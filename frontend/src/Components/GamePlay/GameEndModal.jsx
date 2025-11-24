import "./GameEndModal.css";

const GameEndModal = ({ isOpen, detail, onConfirm, onViewBoard }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="game-end-overlay" role="dialog" aria-modal="true">
            <div className="game-end-modal">
                <h2 className="game-end-title">게임 종료</h2>
                {detail && (
                <pre className="game-end-detail" aria-live="polite">
                    {detail}
                </pre>
                )}
                <div className="game-end-buttons">
                    <button type="button" className="game-end-button" onClick={onViewBoard}>
                        게임판 확인
                    </button>
                    <button type="button" className="game-end-button" onClick={onConfirm}>
                        홈으로 이동
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameEndModal;


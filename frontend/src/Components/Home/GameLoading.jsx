import "./Modal.css";

/**
 * 게임 준비 상태를 표시하는 간단한 오버레이입니다.
 * 전용 라우트 대신 GamePlay 페이지에서 로딩/대기 상황에 재사용됩니다.
 */
const MatchLoadingOverlay = ({ open, primaryText = "전투 준비 중...", secondaryText = "입장 준비 중..." }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="Overlay" role="status" aria-live="polite">
      <div className="modal-main">
        <span className="modal-text">{primaryText}</span>
      </div>
      <div className="extra-text">
        <span className="explain-text">{secondaryText}</span>
      </div>
    </div>
  );
};

export default MatchLoadingOverlay;
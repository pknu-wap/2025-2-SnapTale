import { useEffect } from "react";
import "./ConfirmExitModal.css";

const ConfirmExitModal = ({ isOpen, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-exit-overlay" role="dialog" aria-modal="true">
      <div className="confirm-exit-modal">
        <p className="confirm-exit-message">정말 게임을 종료하시겠습니까?</p>
        <div className="confirm-exit-actions">
          <button type="button" className="confirm-exit-button confirm" onClick={onConfirm}>
            예
          </button>
          <button type="button" className="confirm-exit-button cancel" onClick={onCancel}>
            아니오
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmExitModal;

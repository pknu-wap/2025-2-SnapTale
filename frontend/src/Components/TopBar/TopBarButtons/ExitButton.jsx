import { useState } from "react";
import exitButton from "../../../assets/exitButton.png";
import ConfirmExitModal from "./ConfirmExitModal";
import "./buttonCommon.css";

const ExitButton = ({ onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (typeof onClick === "function") {
      onClick();
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="common-btn exit-btn"
        onClick={handleOpenModal}
        aria-label="Exit"
      >
        <img src={exitButton} alt="Exit" />
      </button>
      <ConfirmExitModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ExitButton;

import React from "react";
import "../styles/ActionPopup.css";
import warningIcon from "../images/warning-icon.png"; 

const ActionPopup = ({ isOpen, title, message, confirmText, cancelText, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="action-popup-overlay">
      <div className="action-popup-content">
        <div className="action-popup-icon">
          <img src={warningIcon} alt="Warning Icon" className="popup-icon-img" />
        </div>
        <h2 className="action-popup-title">{title}</h2>
        <p className="action-popup-message">{message}</p>
        <div className="action-popup-buttons">
          <button className="action-cancel-btn" onClick={onClose}>{cancelText || "Cancel"}</button>
          <button className="action-confirm-btn" onClick={onConfirm}>{confirmText || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
};

export default ActionPopup;

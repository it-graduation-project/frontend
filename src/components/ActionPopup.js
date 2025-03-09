/*
  ActionPopup.js - 사용자 인터랙션을 위한 확인/취소 팝업 컴포넌트
  --------------------------------------------------------------
  - React 기반의 커스텀 팝업 창 (확인/취소 버튼 포함)
  - 경고 아이콘과 메시지를 표시하여 사용자에게 중요한 액션을 안내
  - 외부에서 열림/닫힘 상태를 제어할 수 있도록 `isOpen` prop 사용
  - `onConfirm`, `onClose` 콜백을 통해 사용자의 선택을 핸들링
  - 스타일링은 `ActionPopup.css`에서 관리
*/

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

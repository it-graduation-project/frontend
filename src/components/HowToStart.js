/*
  HowToStart.js - "How to Start" 섹션 컴포넌트
  -------------------------------------------------
  - 사용자가 서비스를 시작하는 3단계 과정을 직관적으로 안내하는 섹션
  - 블루투스 연결, 음악 업로드, 시각 및 촉각 피드백 경험 과정 표현
  - Web Serial API 연결 버튼 포함 (App.js에서 상태 및 함수 전달)
*/

import React from "react";
import "../styles/HowToStart.css";
import musicIcon from "../images/music-icon.png";
import { MdUsb } from "react-icons/md"; 

const HowToStart = ({ onSerialToggle, isSerialConnected }) => {
  
  const handleSerialClick = () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      alert("🚨 Please log in first.");  // 로그인하지 않으면 alert 표시
      return;
    }
    
    onSerialToggle(); // 로그인된 경우 시리얼 연결/해제 실행
  };

  return (
    <section className="how-to-start">
      <div className="steps-container">
        <h2 className="section-title">How to Start</h2>
        <div className="step">
          <div className="step-number">1</div>
          <p>Connect your device via USB</p>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <p>Upload your favorite music file</p>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <p>Feel the music through visuals and vibrations</p>
        </div>
      </div>

      <div className="connect-box">
        <img src={musicIcon} alt="Music Icon" className="music-icon" /> 
        <h3>Ready to Feel the Music?</h3>
        <p>
          Plug in your device via USB <br />
          to start the experience
        </p>
        {/* 로그인 확인 후 Web Serial API 연결 상태에 따라 버튼 문구 변경 */}
        <button className="connect-btn" onClick={handleSerialClick}>
          <MdUsb className="usb-icon" />
          {isSerialConnected ? "Disconnect Device" : "Connect Device"}
        </button>
        <span className="small-text">Simple one-click USB connection</span>
      </div>
    </section>
  );
};

export default HowToStart;

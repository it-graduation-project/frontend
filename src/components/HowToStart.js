/*
  HowToStart.js - "How to Start" 섹션 컴포넌트
  -------------------------------------------------
  - 사용자가 서비스를 시작하는 3단계 과정을 직관적으로 안내하는 섹션
  - 블루투스 연결, 음악 업로드, 시각 및 촉각 피드백 경험 과정 표현
  - 블루투스 연결 버튼 포함
*/

import React from "react";
import "../styles/HowToStart.css";
import musicIcon from "../images/music-icon.png";
import bluetoothIcon from "../images/bluetooth-icon.png";

const HowToStart = () => {
  return (
    <section className="how-to-start">
      <div className="steps-container">
        <h2 className="section-title">How to Start</h2>
        <div className="step">
          <div className="step-number">1</div>
          <p>Connect your Bluetooth device</p>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <p>Upload your favorite music file</p>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <p>Experience music through visual and tactile feedback</p>
        </div>
      </div>

      <div className="connect-box">
        <img src={musicIcon} alt="Music Icon" className="music-icon" /> 
        <h3>Ready to Feel the Music?</h3>
        <p>
          Connect your hardware device via Bluetooth <br />
          to start the experience
        </p>
        <button className="connect-btn">
          <img src={bluetoothIcon} alt="Bluetooth Icon" className="bluetooth-icon" />
          Connect Device
        </button>
        <span className="small-text">Simple one-click Bluetooth connection</span>
      </div>
    </section>
  );
};

export default HowToStart;

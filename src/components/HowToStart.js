/*
  HowToStart.js - "How to Start" 섹션 컴포넌트
  -------------------------------------------------
  - 사용자가 서비스를 시작하는 3단계 과정을 직관적으로 안내하는 섹션
  - 블루투스 연결, 음악 업로드, 시각 및 촉각 피드백 경험 과정 표현
  - 블루투스 연결 버튼 포함
*/

import React, { useState, useEffect } from "react";
import "../styles/HowToStart.css";
import musicIcon from "../images/music-icon.png";
import bluetoothIcon from "../images/bluetooth-icon.png";
import { connectBluetooth, disconnectBluetooth, getBluetoothStatus } from "../utils/bluetoothManager"; // ✅ 블루투스 관리 모듈 import

const HowToStart = () => {
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(getBluetoothStatus()); // ✅ 블루투스 연결 상태 추가

  // ✅ 블루투스 연결 상태가 변경될 때마다 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBluetoothConnected(getBluetoothStatus());
    }, 1000); // 1초마다 상태 확인

    return () => clearInterval(interval); // ✅ 컴포넌트 언마운트 시 정리
  }, []);
  
  // ✅ 버튼 클릭 시 블루투스 연결/해제 토글
  const onToggleBluetooth = async () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      alert("🚨 Please log in first.");  // ✅ 로그인하지 않으면 alert 표시
      return;
    }

    if (isBluetoothConnected) {
      const success = disconnectBluetooth(); // ✅ 블루투스 연결 해제
      if (success) {
        setIsBluetoothConnected(false);
        alert("🔴 Bluetooth disconnected.");
      }
    } else {
      const success = await connectBluetooth(); // ✅ 블루투스 연결
      if (success) {
        setIsBluetoothConnected(true);
        alert("✅ Bluetooth connected successfully!");
      } else {
        alert("🚨 Bluetooth connection failed. Please try again.");
      }
    }
  };

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
        {/* ✅ 블루투스 연결 상태에 따라 버튼 문구 변경 */}
        <button className="connect-btn" onClick={onToggleBluetooth}>
          <img src={bluetoothIcon} alt="Bluetooth Icon" className="bluetooth-icon" />
          {isBluetoothConnected ? "Disconnect Device" : "Connect Device"}
        </button>
        <span className="small-text">Simple one-click Bluetooth connection</span>
      </div>
    </section>
  );
};

export default HowToStart;

/*
  App.js - 애플리케이션의 메인 파일
  -------------------------------------------------
  - 전체적인 애플리케이션 구조를 담당하며 주요 컴포넌트 포함
  - 네비게이션 바, 파일 업로드, 음악 시각화 기능 연결
  - 로그인 및 회원가입 팝업을 관리하여 인증 처리
  - FFT 데이터를 수신하여 블루투스를 통해 ESP32에 전송
*/

import React, { useState, useEffect } from "react";
import "./styles/common.css"; // 글로벌 스타일
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowToStart from "./components/HowToStart";
import FileUpload from "./components/FileUpload";
import Visualizer from "./components/Visualizer"; 
import KeyFeatures from "./components/KeyFeatures";
import Footer from "./components/Footer";
import LoginPopup from "./components/LoginPopup";
import SignupPopup from "./components/SignupPopup";
import ActionPopup from "./components/ActionPopup";
import { sendFFTDataToESP32, startStreamingFFTData, stopStreamingFFTData, getBluetoothStatus } from "./utils/bluetoothManager";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false); // 로그인 팝업 상태
  const [isSignupOpen, setIsSignupOpen] = useState(false); // 회원가입 팝업 상태
  const [token, setToken] = useState(null); // JWT 토큰 상태
  const [audioUrl, setAudioUrl] = useState(null); // 업로드된 음악 URL 상태
  const [popupData, setPopupData] = useState({ isOpen: false });

  // 애플리케이션 시작 시 로컬스토리지에서 JWT 토큰 확인
  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) setToken(storedToken);
  }, []);

  // ✅ 시각화 창에서 FFT 데이터를 수신하고 블루투스로 전송
  useEffect(() => {
    const handleFFTData = (event) => {
      if (event.data.type === "fftData" && getBluetoothStatus()) {
        sendFFTDataToESP32(Math.floor(event.data.value));
      }
    };
    window.addEventListener("message", handleFFTData);
    return () => window.removeEventListener("message", handleFFTData);
  }, []);

  return (
    <div className="App">
      {/* 네비게이션 바 */}
      <Navbar onLoginOpen={() => setIsLoginOpen(true)} />

      {/* 로그인 팝업 */}
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSignupOpen={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
        onLogin={setToken} // 로그인 성공 시 토큰 설정
      />

      {/* 회원가입 팝업 */}
      <SignupPopup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginOpen={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* 히어로 섹션 */}
      <Hero />

       {/* How to Start 섹션 */}
       <HowToStart />

      {/* 파일 업로드 섹션 */}
      <FileUpload onFileUpload={(url) => {
        setAudioUrl(url);
        if (getBluetoothStatus()) {
          startStreamingFFTData();
        }
      }} />

      {/* 업로드된 음악이 있으면 시각화 실행 */}
      {audioUrl && <Visualizer audioUrl={audioUrl} />}

      {/* 주요 기능 섹션 */}
      <KeyFeatures /> 

      {/* 푸터 */}
      <Footer />

      {/* ✅ 공통 ActionPopup 사용 (파일 교체 / 로그아웃) */}
      <ActionPopup {...popupData} />
    </div>
  );
}

export default App;
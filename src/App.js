/*
  App.js - 애플리케이션의 메인 파일
  - 전체적인 구조를 담당하며, 페이지 컴포넌트들을 포함함
  - 음악 파일 업로드 후 시각화할 수 있도록 `Visualizer.js`와 연결
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

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // 업로드된 음악 URL 상태

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) setToken(storedToken);
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
        onLogin={setToken}
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

       {/* How to Start 섹션 추가 */}
       <HowToStart />

      {/* 파일 업로드 섹션 */}
      <FileUpload onFileUpload={setAudioUrl} />

      {/* 업로드된 음악이 있으면 시각화 실행 */}
      {audioUrl && <Visualizer audioUrl={audioUrl} />}

      {/* Key Features 섹션 */}
      <KeyFeatures /> 

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default App;
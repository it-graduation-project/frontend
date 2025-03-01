/*
  App.js - 애플리케이션의 메인 파일
  - 전체적인 구조를 담당하며, 페이지 컴포넌트들을 포함함
  - 음악 파일 업로드 후 시각화할 수 있도록 `Visualizer.js`와 연결
*/

import React, { useState, useEffect } from "react";
import "./styles/common.css"; // 글로벌 스타일
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FileUpload from "./components/FileUpload";
import Visualizer from "./components/Visualizer"; 
import GestureControl from "./components/GestureControl";
import GetStarted from "./components/GetStarted";
import Footer from "./components/Footer";
import LoginPopup from "./components/LoginPopup";
import SignupPopup from "./components/SignupPopup";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) setToken(storedToken);
  }, []);

  // ✅ handleFileUpload를 App.js에 정의하여 Hero.js & FileUpload.js에서 사용 가능
  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true); 
    console.log("🔵 App.js - 파일 업로드 시작:", file.name); 
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("jwtToken");
    console.log("🔑 사용자 토큰:", token);

    if (!token) {
        alert("Please login first.");
        setIsUploading(false);
        return;
    }

    try {
      // console.log("🔑 업로드 시 사용할 토큰:", token); 
      const response = await fetch("http://13.209.19.98:8080/files", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
        mode: "cors",
      });

      const responseText = await response.text();
      console.log("🔴 서버 응답:", responseText);

      if (!response.ok) {
          if (response.status === 403) {
              alert("🚨 Invalid token. Please log in again.");
              localStorage.removeItem("jwtToken"); 
          } else {
              alert(`🚨 Upload failed: ${responseText}`);
          }
          setIsUploading(false);
          return;
      }

      let data;
      try {
          data = JSON.parse(responseText);
      } catch (error) {
          console.error("🛑 JSON 파싱 오류:", error);
          alert("🚨 Server error: Invalid response format.");
          setIsUploading(false);
          return;
      }

      if (data.fileUrl) {
          console.log("🟢 App.js - 서버에서 받은 파일 URL:", data.fileUrl);
          setAudioUrl(data.fileUrl);
      } else {
          console.error("🛑 App.js - 서버 응답 오류:", data);
      }
  } catch (error) {
      console.error("🛑 App.js - 파일 업로드 실패:", error);
      alert("🚨 Upload failed. Please try again.");
  } finally {
      setIsUploading(false);
  }
};

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
      <Hero onFileUpload={handleFileUpload} />

      {/* 파일 업로드 + 특징 섹션 */}
      <FileUpload onFileUpload={handleFileUpload} />

      {audioUrl && <Visualizer audioUrl={audioUrl} />}

      {/* 제스처 컨트롤 섹션 */}
      <GestureControl />

      {/* 시작하기 섹션 */}
      <GetStarted />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default App;
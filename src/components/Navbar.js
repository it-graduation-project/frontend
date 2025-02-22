/*
  Navbar.js - 네비게이션 바 컴포넌트
  - 상단 메뉴바를 표시
  - 로그인 버튼 클릭 시 팝업을 열 수 있도록 이벤트 처리
  - 로그인 상태에 따라 UI 변경 (로그인/로그아웃 버튼)
*/

import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import logoImage from "../images/logo.png";
import LoginPopup from "./LoginPopup"; 
import SignupPopup from "./SignupPopup";

const Navbar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false); 
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false);

  // 💡 사용자 정보 요청 (로그인 상태 유지)
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch("http://13.209.19.98:8080/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("🔍 User Info Response:", data);

      if (response.ok) {
        setUserInfo({ email: data.email, username: data.username });  
      } else {
        console.error("User info fetch failed:", data.message);

        // ✅ JWT가 만료되었으면 자동 로그아웃
        if (response.status === 401) {
          console.log("🔴 JWT 만료됨, 로그아웃 처리");
          localStorage.removeItem("jwtToken");
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error("Fetching user info failed:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return; // ✅ jwtToken이 없으면 fetchUserInfo() 호출 안 함
    fetchUserInfo(token);
  }, []);

  // 🔥 로그인 성공 시 실행할 함수
  const onLoginSuccess = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetchUserInfo(token); // 🔥 로그인 후 사용자 정보 다시 가져옴
    }
  };

  // 💡 로그아웃 기능 수정 (localStorage.clear() 후 새로고침)
  const handleLogout = () => {
    console.log("🔴 Logging out...");

    // 🔥 모든 저장된 데이터 삭제
    localStorage.clear();

    // 🔥 상태 초기화
    setUserInfo(null);

    // 🔥 페이지 새로고침하여 전체 상태 초기화
    window.location.reload();
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <img src={logoImage} alt="SoundSense Logo" className="logo" />
        </div>
        
        <div className="navbar-right">
          {userInfo ? (
            <div className="user-info">
              <span className="welcome-text">
                Welcome, <span className="username">{userInfo.username}</span>
              </span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setLoginPopupOpen(true)}>Login</button> 
          )}
        </div>
      </header>
      <div className="navbar-bottom-line"></div>

      {/* 🔥 LoginPopup에 onLoginSuccess 전달 */}
      <LoginPopup 
        isOpen={isLoginPopupOpen} 
        onClose={() => setLoginPopupOpen(false)}
        onSignupOpen={() => { 
          setLoginPopupOpen(false); 
          setSignupPopupOpen(true); 
        }} 
        onLoginSuccess={onLoginSuccess} 
      />

      <SignupPopup 
        isOpen={isSignupPopupOpen} 
        onClose={() => setSignupPopupOpen(false)}
        onLoginOpen={() => { 
          setSignupPopupOpen(false); 
          setLoginPopupOpen(true); 
        }} 
      />
    </>
  );
};

export default Navbar;
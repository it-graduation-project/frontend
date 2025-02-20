/*
  Navbar.js - 네비게이션 바 컴포넌트
  - 상단 메뉴바를 표시
  - 로그인 버튼 클릭 시 팝업을 열 수 있도록 이벤트 처리
  - 로그인 상태에 따라 UI 변경 (로그인/로그아웃 버튼)
*/

import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import logoImage from "../images/logo.png";
import LoginPopup from "./LoginPopup"; // 🔥 LoginPopup import 추가

const Navbar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false); // 🔥 로그인 팝업 상태 추가

  // 💡 사용자 정보 요청 (로그인 상태 유지)
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch("http://13.124.228.23:8080/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUserInfo({ email: data.email, username: data.username });  // 💡 사용자 정보 저장
      } else {
        console.error("User info fetch failed:", data.message);
      }
    } catch (error) {
      console.error("Fetching user info failed:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetchUserInfo(token);
    }

    return () => {
      // 🔥 클린업 함수 추가 (메모리 누수 방지)
      setUserInfo(null);
    };
  }, []);

  // 🔥 로그인 성공 시 실행할 함수
  const onLoginSuccess = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetchUserInfo(token); // 🔥 로그인 후 사용자 정보 다시 가져옴
    }
  };

  // 💡 로그아웃 기능 추가
  const handleLogout = () => {
    console.log("🔴 Logging out...");
    localStorage.removeItem("jwtToken");  // 🔥 JWT 토큰 삭제
    setUserInfo(null);  // 🔥 상태 업데이트
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
              <span className="welcome-text">{userInfo.username}님 환영합니다!</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setLoginPopupOpen(true)}>Login</button> // 🔥 Login 버튼 클릭 시 팝업 열기
          )}
        </div>
      </header>
      <div className="navbar-bottom-line"></div>

      {/* 🔥 LoginPopup에 onLoginSuccess 전달 */}
      <LoginPopup 
        isOpen={isLoginPopupOpen} 
        onClose={() => setLoginPopupOpen(false)}
        onSignupOpen={() => {}} 
        onLoginSuccess={onLoginSuccess} 
      />
    </>
  );
};

export default Navbar;
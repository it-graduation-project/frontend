/*
  Navbar.js - 네비게이션 바 컴포넌트
  -------------------------------------------------
  - 상단 메뉴바를 표시하며 로그인/로그아웃 UI를 관리
  - 로그인 상태에 따라 UI를 변경 (로그인 시 사용자 정보 표시, 로그아웃 시 로그인 버튼 표시)
  - 로그인 및 회원가입 팝업을 열 수 있도록 이벤트 처리
  - JWT 토큰을 이용해 로그인 상태를 유지하고 자동 로그아웃 처리
*/

import React, { useState, useEffect } from "react";
import { closeAllVisualizerWindows, visualizerWindows, cleanupVisualizerWindows } from "../utils/visualizerManager"; // 전역 배열 import
import "../styles/Navbar.css";
import logoImage from "../images/logo.png";
import LoginPopup from "./LoginPopup"; 
import SignupPopup from "./SignupPopup";
import ActionPopup from "./ActionPopup";


const Navbar = () => {
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false); // 로그인 팝업 상태
  const [isSignupPopupOpen, setSignupPopupOpen] = useState(false); // 회원가입 팝업 상태
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

// 사용자 정보 요청 (JWT 토큰 기반 로그인 유지)
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("🔍 User Info Response:", data);

      if (response.ok) {
        setUserInfo({ email: data.email, username: data.username }); // 사용자 정보 설정 
      } else {
        console.error("User info fetch failed:", data.message);

        // JWT 만료 시 자동 로그아웃 처리
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
    if (!token) return; // jwtToken이 없으면 사용자 정보 요청 안 함
    fetchUserInfo(token);
  }, []);

  // 로그인 성공 시 실행될 함수 (사용자 정보 갱신)
  const onLoginSuccess = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetchUserInfo(token); // 로그인 후 사용자 정보 새로 불러옴
    }
  };

  const handleLogout = () => {
    cleanupVisualizerWindows(); // 닫힌 창 정리
  
    // 시각화 창이 하나라도 열려 있으면 경고 팝업 띄우기
    if (visualizerWindows.length > 0) {
      setIsLogoutPopupOpen(true);
    } else {
      handleConfirmLogout(); // 창이 닫혀 있으면 바로 로그아웃 실행
    }
  };

  // 팝업에서 "Log Out" 버튼을 누르면 실행
  const handleConfirmLogout = () => {
    console.log("🔴 Logging out...");

    // 시각화 창이 열려있으면 웹캠 닫기 메시지 전송 후 닫기
    visualizerWindows.forEach(win => {
      if (win && !win.closed) {
        win.postMessage({ action: "closeWebcam" }, "*");
        win.close();
      }
    });

    closeAllVisualizerWindows();
    localStorage.clear(); // 모든 저장된 데이터 삭제
    setUserInfo(null); // 상태 초기화
    window.location.reload(); // 페이지 새로고침
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

      {/* 로그인 팝업 (onLoginSuccess 콜백 포함) */}
      <LoginPopup 
        isOpen={isLoginPopupOpen} 
        onClose={() => setLoginPopupOpen(false)}
        onSignupOpen={() => { 
          setLoginPopupOpen(false); 
          setSignupPopupOpen(true); 
        }} 
        onLoginSuccess={onLoginSuccess} 
      />

      {/* 회원가입 팝업 */}
      <SignupPopup 
        isOpen={isSignupPopupOpen} 
        onClose={() => setSignupPopupOpen(false)}
        onLoginOpen={() => { 
          setSignupPopupOpen(false); 
          setLoginPopupOpen(true); 
        }} 
      />

      {/* 로그아웃 확인 팝업 */}
      <ActionPopup
        isOpen={isLogoutPopupOpen}
        title="Are you sure you want to log out?"
        message="All visualizations will be closed."
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout} // 로그아웃 확정 버튼 누르면 실행
        onClose={() => setIsLogoutPopupOpen(false)} // 팝업 닫기
      />
    </>
  );
};

export default Navbar;
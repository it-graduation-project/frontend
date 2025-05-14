/*
  LoginPopup.js - 로그인 팝업 컴포넌트
  -------------------------------------------------
  - 사용자가 이메일과 비밀번호를 입력하여 로그인할 수 있음
  - 로그인 요청 후 JWT 토큰을 저장하여 인증에 활용
  - 회원가입 페이지로 이동할 수 있는 링크 포함
  - 팝업이 닫히면 입력값 초기화
*/

import React, { useState, useEffect } from "react";
import "../styles/Popup.css"; // 공통 팝업 스타일 

const LoginPopup = ({ isOpen, onClose, onSignupOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState(""); // 사용자 이메일 입력 상태
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태
  const [error, setError] = useState(""); // 오류 메시지 상태
  const API_URL = process.env.REACT_APP_API_URL;

  // 팝업이 닫힐 때 입력값 초기화
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null; // 팝업이 닫혀있으면 렌더링 X

  // 로그인 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 기존 오류 메시지 초기화

    try {
      const response = await fetch(`${API_URL}/auth/login`, {  // AWS 서버 주소 사용
        method: "POST",
        headers: { "Content-Type": "application/json" }, // JSON 형식으로 요청
        body: JSON.stringify({ email, password }), // 이메일과 비밀번호를 JSON 데이터로 전송
      });

      const data = await response.json(); // 응답 데이터를 JSON으로 변환  
      console.log("Login Response:", data);

      if (response.ok) {
        if (data.token) {
          console.log("🔑 저장할 JWT 토큰:", data.token);
  
          // "Bearer " 접두어를 제거한 JWT 토큰 저장
          const tokenWithoutBearer = data.token.replace("Bearer ", "");
          localStorage.setItem("jwtToken", tokenWithoutBearer);
  
          onLoginSuccess(); // 로그인 성공 시 콜백 함수 실행
          onClose();
        } else {
          setError(data.message || "Login failed.");
        }
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      setError("An error occurred.");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}> {/* 팝업 외부 클릭 시 닫힘 */}
      <div className="popup-content" onClick={(e) => e.stopPropagation()}> {/* 팝업 내부 클릭 방지 */}
        <div className="popup-header">
          <h2 className="popup-title">Login</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        {error && <p className="popup-error">{error}</p>} {/* 오류 메시지 표시 */}
        <form onSubmit={handleSubmit}>
          <label className="popup-label">Email</label>
          <input
            type="email"
            className="popup-input full-width"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
          <label className="popup-label">Password</label>
          <input
            type="password"
            className="popup-input full-width"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <div className="popup-footer">
            <button type="submit" className="popup-submit-btn full-width">Login</button>
          </div>
        </form>
        <p className="popup-note">
          Don't have an account?<br />
          <a href="#" onClick={onSignupOpen}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;

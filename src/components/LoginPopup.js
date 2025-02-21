/*
  LoginPopup.js - 로그인 팝업 컴포넌트
  - 사용자가 이메일과 비밀번호를 입력하여 로그인할 수 있음
*/

import React, { useState, useEffect } from "react";
import "../styles/Popup.css"; // 공통 팝업 스타일 

const LoginPopup = ({ isOpen, onClose, onSignupOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 팝업이 닫힐 때 입력값 초기화
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null; // 팝업이 닫혀있으면 렌더링 X

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://13.209.19.98:8080/auth/login", {  // 💡 AWS 서버 주소 사용
        method: "POST",
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ email, password }),  
      });

      const data = await response.json();  
      console.log("Login Response:", data);

      if (response.ok) {
        if (data.token) {
          console.log("🔑 저장할 JWT 토큰:", data.token);
  
          // 
          const tokenWithoutBearer = data.token.replace("Bearer ", "");
          localStorage.setItem("jwtToken", tokenWithoutBearer);
  
          onLoginSuccess(); 
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
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 className="popup-title">Login</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        {error && <p className="popup-error">{error}</p>}
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
            <button type="submit" className="popup-login-btn full-width">Login</button>
          </div>
        </form>
        <p className="popup-signup">
          Don't have an account?<br />
          <a href="#" onClick={onSignupOpen}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;

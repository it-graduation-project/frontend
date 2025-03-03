/*
  SignupPopup.js - 회원가입 팝업 컴포넌트
  -------------------------------------------------
  - 사용자가 새 계정을 생성할 수 있도록 지원
  - 이메일, 비밀번호, 이름을 입력하여 회원가입 요청을 보냄
  - 비밀번호 확인 기능 포함 (비밀번호 일치 여부 확인)
  - 회원가입 성공 시 로그인 팝업을 자동으로 열도록 처리
*/

import React, { useState, useEffect } from "react";
import "../styles/Popup.css"; // 공통 팝업 스타일

const SignupPopup = ({ isOpen, onClose, onLoginOpen }) => {
  const [username, setName] = useState(""); // 사용자 이름 입력 상태
  const [email, setEmail] = useState(""); // 이메일 입력 상태
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 입력 상태
  const [error, setError] = useState(""); // 오류 메시지 상태

  // 팝업이 닫힐 때 입력값 초기화
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null; // 팝업이 닫혀있으면 렌더링 X

  // 회원가입 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://13.209.19.98:8080/auth/register", { // AWS 서버 주소 사용
        method: "POST",
        headers: { "Content-Type": "application/json" }, // JSON 형식으로 요청 
        body: JSON.stringify({ email, password, username }), // 회원가입 데이터 전송  
      });

      const data = await response.json(); // 응답 데이터를 JSON으로 변환 
      console.log("Signup Response:", data);

      if (response.ok) {
        if (data.message === "User registered successfully") { 
          alert("Registration successful! Please log in.");
          onClose();
          onLoginOpen(); 
        } else {
          setError(data.message || "Signup failed.");
        }
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup request failed:", error);
      setError("An error occurred.");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}> {/* 팝업 외부 클릭 시 닫힘 */}
      <div className="popup-content" onClick={(e) => e.stopPropagation()}> {/* 팝업 내부 클릭 방지 */}
        <div className="popup-header">
          <h2 className="popup-title">Sign Up</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        {error && <p className="popup-error">{error}</p>} {/* 오류 메시지 표시 */}
        <form onSubmit={handleSubmit}>
          <label className="popup-label">Name</label>
          <input
            type="text"
            className="popup-input full-width"
            value={username}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
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
          <label className="popup-label">Confirm Password</label>
          <input
            type="password"
            className="popup-input full-width"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
          <div className="popup-footer">
            <button type="submit" className="popup-submit-btn full-width">Sign Up</button>
          </div>
        </form>
        <p className="popup-note">
          Already have an account?<br />
          <a href="#" onClick={onLoginOpen}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPopup;

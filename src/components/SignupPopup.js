/*
  SignupPopup.js - 회원가입 팝업 컴포넌트
  - 사용자가 새 계정을 생성할 수 있음
*/

import React, { useState } from "react";
import "../styles/Popup.css"; // 공통 팝업 스타일

const SignupPopup = ({ isOpen, onClose, onLoginOpen }) => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null; // 팝업이 닫혀있으면 렌더링 X

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://13.124.228.23:8080/auth/register", {  // 💡 AWS 서버 주소 사용
        method: "POST",
        headers: { "Content-Type": "application/json" },  // 💡 JSON 형식으로 변경
        body: JSON.stringify({ email, password, username }),  // 💡 username 추가
      });

      const data = await response.json();  // 💡 JSON 응답 처리
      console.log("Signup Response:", data);

      if (response.ok) {
        if (data.message === "User registered successfully") {  // 💡 성공 응답 메시지 확인
          alert("Registration successful! Please log in.");
          onClose();
          onLoginOpen(); // 회원가입 후 로그인 팝업 열기
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
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 className="popup-title">Sign Up</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        {error && <p className="popup-error">{error}</p>}
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
            <button type="submit" className="popup-login-btn full-width">Sign Up</button>
          </div>
        </form>
        <p className="popup-signup">
          Already have an account?<br />
          <a href="#" onClick={onLoginOpen}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPopup;

/*
  GetStarted.js - 시작하기 섹션 컴포넌트
  - 사용자를 서비스 이용으로 유도하는 섹션
*/

import React from "react";
import "../styles/GetStarted.css";
import getStartedIconImage from "../images/get-started-icon.png";

const GetStarted = () => {
  return (
    <section className="get-started-section">
      <h2>Ready to Experience Music in a New Way?</h2>
      <p>Join our community and transform how you experience music</p>
      <button className="get-started-btn">
        <img src={getStartedIconImage} alt="Get Started Icon" className="start-icon" />
        Get Started Now
      </button>
    </section>
  );
};

export default GetStarted;

/*
  Hero.js - 히어로 섹션 컴포넌트
  - 사용자에게 사이트의 주요 기능을 소개
  - 업로드 버튼을 통해 음악 파일 업로드 기능과 연결
*/

import React from "react";
import "../styles/Hero.css";
import waveImage from "../images/wave.png";
import musicIconImage from "../images/music-icon.png";

const Hero = ({ onFileUpload }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Experience Music Through Sight and Touch</h1>
        <p>
          Transform music into visual and tactile experiences. Our innovative
          technology helps the deaf community experience music in a whole new way.
        </p>
        <button className="upload-btn" onClick={() => document.getElementById("heroFileInput").click()}>
          <img src={musicIconImage} alt="Music Icon" className="music-icon" />
          Upload Music
        </button>
        <input
          type="file"
          id="heroFileInput"  
          style={{ display: "none" }}
          accept=".mp3,.wav,.flac"
          onClick={(e) => (e.target.value = null)} // 클릭할 때 값 초기화
          onChange={(e) => {
            if (e.target.files.length === 0) return;
            console.log("🔵 Hero.js - 파일 선택됨:", e.target.files[0]);
            onFileUpload(e.target.files[0]);
          }}
        />
      </div>
      <img src={waveImage} alt="Wave Graphic" className="wave-graphic" />
    </section>
  );
};

export default Hero;

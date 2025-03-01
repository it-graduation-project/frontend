/*
  Hero.js - 히어로 섹션 컴포넌트
  -------------------------------------------------
  - 사용자가 웹사이트에 처음 방문했을 때 가장 먼저 보는 핵심 섹션
  - "Vision and Touch"를 강조하며, 음악을 시각적/촉각적으로 경험하는 컨셉 전달
  - 배경 그래픽 및 소개 텍스트 포함
*/

import React from "react";
import "../styles/Hero.css";
import waveImage from "../images/wave.png";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Experience Music through <br /> 
          <span className="highlight-text">Vision and Touch</span> 
        </h1>
        <p>
          RhyFeel is an innovative music experience platform that 
          transforms music into visual and tactile sensations, making 
          music accessible to everyone, including the hearing-impaired community. 
        </p>
      </div>
      <img src={waveImage} alt="Wave Graphic" className="wave-graphic" />
    </section>
  );
};

export default Hero;

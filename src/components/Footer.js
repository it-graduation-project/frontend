/*
  Footer.js - 푸터 컴포넌트
  - 사이트 하단에 GitHub, 이메일 등의 정보 제공
*/

import React from "react";
import { FaGithub, FaEnvelope } from "react-icons/fa"; // 아이콘 추가
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>RhyFeel</h3>
        <p>Experience music beyond sound. A multi-sensory platform that lets you feel every beat.</p>
        
        <div className="footer-links">
          <a href="https://github.com/it-graduation-project" target="_blank" rel="noopener noreferrer">
            <FaGithub className="footer-icon" /> GitHub
          </a>
          <a href="mailto:daninld@sookmyung.ac.kr">
            <FaEnvelope className="footer-icon" /> daninld@sookmyung.ac.kr
          </a>
          <a href="mailto:gkstmf578@sookmyung.ac.kr">
            <FaEnvelope className="footer-icon" /> gkstmf578@sookmyung.ac.kr
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 RhyFeel. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

/*
  Footer.js - 푸터 컴포넌트
  - 사이트 하단에 고정된 정보 및 링크 제공
*/

import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <div className="footer-column">
          <h3>Company</h3>
          <ul>
            <li>About</li>
            <li>Careers</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li>Help Center</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Connect</h3>
          <ul>
            <li>Twitter</li>
            <li>Instagram</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 SoundSense. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

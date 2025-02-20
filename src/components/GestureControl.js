/*
  GestureControl.js - 제스처 컨트롤 섹션 컴포넌트
  - 사용자가 손동작을 통해 음악을 조작할 수 있도록 설명하는 섹션
*/

import React from "react";
import "../styles/GestureControl.css";
import gestureOverviewImage from "../images/gesture.png";
import enableGestureIconImage from "../images/enable-icon.png";
import fistGestureIcon from "../images/fist-icon.png";
import thumbUpGestureIcon from "../images/thumb-up-icon.png";
import thumbDownGestureIcon from "../images/thumb-down-icon.png";
import pointRightGestureIcon from "../images/point-right-icon.png";
import pointLeftGestureIcon from "../images/point-left-icon.png";

const GestureControl = () => {
  return (
    <section className="gesture-section">
    <h2>Gesture Control Music Player</h2>
    <p>
      Control your music with natural hand gestures using your webcam. Simple, intuitive,
      and fun way to interact with your music.
    </p>
    <div className="gesture-content">
      <img src={gestureOverviewImage} alt="Gesture Control Overview" className="gesture-image" />
      <div className="gesture-details">
        <button className="gesture-btn">
          <img src={enableGestureIconImage} alt="Enable Gesture Icon" className="enable-icon" />
          Enable Gesture Control
        </button>
        <div className="gesture-list">
          <h3>Supported Gestures</h3>
          <ul>
            <li>
              <div className="gesture-item">
                <div className="gesture-icon">
                  <img src={fistGestureIcon} alt="Fist Gesture Icon" />
                </div>
                <div className="gesture-description">
                  <strong>Fist</strong>
                  <span>Play/Pause Music</span>
                </div>
              </div>
            </li>
            <li>
              <div className="gesture-item">
                <div className="gesture-icon">
                  <img src={thumbUpGestureIcon} alt="Thumb Up Gesture Icon" />
                </div>
                <div className="gesture-description">
                  <strong>Thumb Up</strong>
                  <span>Increase Vibration Intensity</span>
                </div>
              </div>
            </li>
            <li>
              <div className="gesture-item">
                <div className="gesture-icon">
                  <img src={thumbDownGestureIcon} alt="Thumb Down Gesture Icon" />
                </div>
                <div className="gesture-description">
                  <strong>Thumb Down</strong>
                  <span>Decrease Vibration Intensity</span>
                </div>
              </div>
            </li>
            <li>
              <div className="gesture-item">
                <div className="gesture-icon">
                  <img src={pointRightGestureIcon} alt="Point Right Gesture Icon" />
                </div>
                <div className="gesture-description">
                  <strong>Point Right</strong>
                  <span>Next Song</span>
                </div>
              </div>
            </li>
            <li>
              <div className="gesture-item">
                <div className="gesture-icon">
                  <img src={pointLeftGestureIcon} alt="Point Left Gesture Icon" />
                </div>
                <div className="gesture-description">
                  <strong>Point Left</strong>
                  <span>Previous Song</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  );
};

export default GestureControl;

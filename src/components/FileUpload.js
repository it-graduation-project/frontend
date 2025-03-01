/*
  FileUpload.js - 음악 업로드 및 특징 소개 섹션
  - 사용자가 음악을 업로드하고 시각화를 경험할 수 있도록 함
*/

import React, { useState } from "react";
import "../styles/FileUpload.css";
import uploadIconImage from "../images/upload-icon.png";
import frequencyIconImage from "../images/frequency-icon.png";
import emotionIconImage from "../images/emotion-icon.png";
import hapticIconImage from "../images/haptic-icon.png";

const FileUpload = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const allowedExtensions = new Set(["mp3", "wav", "flac"]);

  return (
    <section className="upload-section">
      <h2>Upload and Visualize</h2>
      <p>Drop your music file and watch it transform into an immersive visual experience</p>
      <div
        className={`upload-box ${isDragOver ? "drag-over" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);

          const file = e.dataTransfer.files[0];

          if (file) {
            const fileExtension = file.name.split(".").pop().toLowerCase();
            if (!allowedExtensions.has(fileExtension)) {
              alert("🚨 Unsupported file type. Please upload MP3, WAV, or FLAC files.");
              return;
            }
            onFileUpload(file);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <img src={uploadIconImage} alt="Upload Icon" className="upload-icon" />
        <h3>Drag and drop your audio file here</h3>
        <p>or</p>
        <button className="browse-btn" onClick={() => document.getElementById("uploadFileInput").click()}>
          Browse Files
        </button>
        <p className="upload-support">Supported formats: MP3, WAV, FLAC (Max 20MB)</p>
        <input
          type="file"
          id="uploadFileInput"  
          style={{ display: "none" }}
          accept=".mp3,.wav,.flac"
          onClick={(e) => (e.target.value = null)} // 클릭할 때 값 초기화
          onChange={(e) => {
            if (e.target.files.length === 0) return;
            console.log("🔵 FileUpload.js - 파일 선택됨:", e.target.files[0]);
            onFileUpload(e.target.files[0]);
          }}
        />
      </div>
      <div className="feature-cards">
          <div className="feature-card">
            <img src={frequencyIconImage} alt="Frequency Icon" className="feature-icon" />
            <h3>Frequency Visualization</h3>
            <p>See music transformed into dynamic visual patterns based on frequency and amplitude</p>
          </div>
          <div className="feature-card">
            <img src={emotionIconImage} alt="Emotion Icon" className="feature-icon" />
            <h3>Emotion Analysis</h3>
            <p>Experience the emotional journey of music through color and movement</p>
          </div>
          <div className="feature-card">
            <img src={hapticIconImage} alt="Haptic Icon" className="feature-icon" />
            <h3>Haptic Feedback</h3>
            <p>Feel the rhythm through synchronized vibration patterns</p>
          </div>
        </div>
    </section>
  );
};

export default FileUpload;

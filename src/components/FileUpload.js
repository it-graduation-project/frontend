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
  const [isUploading, setIsUploading] = useState(false); // 업로드 진행 상태
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true); // 업로드 시작
    console.log("🔵 FileUpload.js - 파일 업로드 시작:", file.name); 
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("jwtToken");
    console.log("🔑 사용자 토큰:", token);

    if (!token) {
        alert("Please login first.");
        setIsUploading(false);
        return;
    }

    try {
      // console.log("🔑 업로드 시 사용할 토큰:", token); // 🔥 토큰 출력해서 확인
      const response = await fetch("http://13.209.19.98:8080/files", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
        mode: "cors",
      });

      const responseText = await response.text();
      console.log("🔴 서버 응답:", responseText);

      if (!response.ok) {
          if (response.status === 403) {
              alert("🚨 Invalid token. Please log in again.");
              localStorage.removeItem("jwtToken"); // 🔥 잘못된 토큰 제거
          } else {
              alert(`🚨 Upload failed: ${responseText}`);
          }
          setIsUploading(false);
          return;
      }

      let data;
      try {
          data = JSON.parse(responseText);
      } catch (error) {
          console.error("🛑 JSON 파싱 오류:", error);
          alert("🚨 Server error: Invalid response format.");
          setIsUploading(false);
          return;
      }

      if (data.fileUrl) {
          console.log("🟢 FileUpload.js - 서버에서 받은 파일 URL:", data.fileUrl);
          setAudioUrl(data.fileUrl);
          onFileUpload(data.fileUrl);
      } else {
          console.error("🛑 FileUpload.js - 서버 응답 오류:", data);
      }
  } catch (error) {
      console.error("🛑 FileUpload.js - 파일 업로드 실패:", error);
      alert("🚨 Upload failed. Please try again.");
  } finally {
      setIsUploading(false);
  }
};

  return (
    <section className="upload-section">
      <h2>Upload and Visualize</h2>
      <p>Drop your music file and watch it transform into an immersive visual experience</p>
      <div
        className={`upload-box ${isDragOver ? "drag-over" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files[0]);
          setIsDragOver(false);
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
        <button className="browse-btn" onClick={() => document.getElementById("fileInput").click()}>
          Browse Files
        </button>
        <p className="upload-support">Supported formats: MP3, WAV, FLAC (Max 20MB)</p>
      </div>
      {audioUrl && <audio controls src={audioUrl} className="audio-player" />}
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

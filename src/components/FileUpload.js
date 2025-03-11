/*
  FileUpload.js - 음악 업로드 섹션
  -------------------------------------------------
  - 사용자가 음악을 업로드하고 시각화를 경험할 수 있도록 함
  - MP3, WAV, FLAC 형식의 오디오 파일을 지원
  - 파일 드래그 & 드롭 및 직접 선택 방식으로 업로드 가능
  - 업로드된 파일을 서버로 전송하고, 성공 시 해당 URL을 반환받음
*/

import React, { useState } from "react";
import "../styles/FileUpload.css";
import uploadIconImage from "../images/upload-icon.png";
import ActionPopup from "./ActionPopup";
import { cleanupVisualizerWindows, visualizerWindows, closeAllVisualizerWindows } from "../utils/visualizerManager";

const FileUpload = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false); // 파일 드래그 중 여부
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태 여부
  const [audioUrl, setAudioUrl] = useState(null); // 업로드된 파일의 URL 저장
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const allowedExtensions = new Set(["mp3", "wav", "flac"]);

  // ✅ 로그인 여부 확인 후 파일 선택기 활성화
  const onBrowseFilesClick = () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      alert("🚨 Please log in first.");  // 로그인하지 않으면 alert 표시
      return;
    }

    document.getElementById("uploadFileInput").click();
  };

  // ✅ 드래그앤드롭 시 로그인 체크 후 업로드
  const onDropFile = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("🚨 Please log in first.");  // 로그인하지 않으면 alert 표시
      return;
    }

    const file = e.dataTransfer.files[0]; // 드롭된 파일 가져오기

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.has(fileExtension)) {
        alert("🚨 Unsupported file type. Please upload MP3, WAV, or FLAC files.");
        return;
      }
      handleFileUpload(file);
    }
  };

  // 파일 업로드를 처리하는 함수
  const handleFileUpload = async (file) => {
    if (!file) return;

    // 시각화 창 목록 정리 (닫힌 창 삭제)
    cleanupVisualizerWindows();

    // 기존 음악이 있고 시각화 창이 열려 있다면 경고창 띄우기
    if (audioUrl && visualizerWindows.length > 0) {
      console.error("기존 음악이 있고 시각화 창이 열려 있음");
      setSelectedFile(file);
      setIsPopupOpen(true);
      return;
    }

    // 시각화 창이 닫혀 있으면 경고 없이 바로 업로드
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    console.log("🔵 FileUpload.js - 파일 업로드 시작:", file.name);
    
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("jwtToken");
    console.log("🔑 사용자 토큰:", token);

    try {
      // console.log("🔑 업로드 시 사용할 토큰:", token); 
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
              localStorage.removeItem("jwtToken"); 
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
          closeAllVisualizerWindows(); // ✅ 기존 시각화 창 닫기
          setAudioUrl(data.fileUrl); // ✅ 새로운 음악 URL 설정
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
        onDrop={onDropFile}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <img src={uploadIconImage} alt="Upload Icon" className="upload-icon" />
        <h3>Drag and drop your music file here</h3>
        <p>or</p>
        <button className="browse-btn" onClick={onBrowseFilesClick}>
          Browse Files
        </button>
        <p className="upload-support">Supported formats: MP3, WAV, FLAC (Max 20MB)</p>
        <input
          type="file"
          id="uploadFileInput"  
          style={{ display: "none" }}
          accept=".mp3,.wav,.flac"
          onClick={(e) => (e.target.value = null)} // 클릭할 때마다 선택 초기화
          onChange={(e) => {
            if (e.target.files.length === 0) return;
            console.log("🔵 FileUpload.js - 파일 선택됨:", e.target.files[0]);
            handleFileUpload(e.target.files[0]);
          }}
        />
      </div>

      {/* ✅ 기존 음악 파일이 있을 때 교체할지 묻는 팝업 */}
      <ActionPopup
        isOpen={isPopupOpen}
        title="You have already uploaded a music file"
        message="Uploading a new file will erase the current analysis. Do you want to continue?"
        confirmText="Replace File"
        cancelText="Cancel"
        onConfirm={() => {
          setIsPopupOpen(false);
          uploadFile(selectedFile); // 새 파일 업로드 실행
        }}
        onClose={() => setIsPopupOpen(false)}
      />
    </section>
  );
};

export default FileUpload;

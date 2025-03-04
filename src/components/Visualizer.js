/*
  Visualizer.js - 음악 시각화 실행 컴포넌트 (새 창 버전)
  -------------------------------------------------
  - `audioUrl`을 props로 받아 Three.js 기반의 시각화를 새 창에서 실행
  - `window.open()`을 사용하여 `public/visualizer/index.html`을 새 창에서 로드
  - React와 Three.js 코드의 충돌을 방지하면서 독립적으로 시각화를 유지
  - 팝업 차단 여부를 확인하고 새 창을 닫는 로직 포함
  - FFT 데이터를 시각화 창에서 분석 후 React로 전송
*/

import React, { useEffect } from "react";
import { visualizerWindows, closeAllVisualizerWindows } from "../utils/visualizerManager"; // 전역 배열, 기존 창 닫는 함수 import

const Visualizer = ({ audioUrl }) => { 
  useEffect(() => {
    if (!audioUrl) return; // 음악 파일이 없으면 실행하지 않음

    // 기존 창이 있을 때 닫기
    if (visualizerWindows.length > 0) {
      closeAllVisualizerWindows();
    }

    // 새 창에서 시각화 페이지를 로드할 URL 생성 (React에서 전달된 audioUrl 추가)
    const visualizerUrl = `/visualizer/index.html?audioUrl=${encodeURIComponent(audioUrl)}`;
    console.log("🌐 새 창에서 시각화 화면 열기:", visualizerUrl);

    // 새 창을 열어 시각화 실행
    const newWindow = window.open(visualizerUrl, "_blank", "width=1200,height=800");

    if (newWindow) {
      visualizerWindows.push(newWindow);
    
      // 창이 닫힐 때 `visualizerWindows`에서 자동 제거
      newWindow.onbeforeunload = () => {
        const index = visualizerWindows.indexOf(newWindow);
        if (index > -1) {
          visualizerWindows.splice(index, 1);
        }
      };
    } else {
      console.error("❌ 팝업 차단으로 인해 새 창을 열 수 없습니다.");
      alert("🚨 Popup blocked! Please allow pop-ups and try again.");
    }
    
    visualizerWindows.push(newWindow); // 전역 배열에 추가

    // 창이 닫히면 배열에서 제거
    newWindow.onbeforeunload = () => {
      const index = visualizerWindows.indexOf(newWindow);
      if (index > -1) {
        visualizerWindows.splice(index, 1);
      }
    };
    
    // ✅ FFT 데이터를 시각화 창에서 분석 후 React로 전송
    const handleFFTResponse = (event) => {
      if (event.data.type === "fftData") {
        window.opener?.postMessage({ type: "fftData", value: event.data.value }, "*");
      }
    };
    
    window.addEventListener("message", handleFFTResponse);

    // 컴포넌트가 언마운트될 때 새 창 닫기
    return () => {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
      window.removeEventListener("message", handleFFTResponse);
    };
  }, [audioUrl]);

  return null; // 시각화는 새 창에서 실행되므로 UI 요소 렌더링 없음
};

export default Visualizer;
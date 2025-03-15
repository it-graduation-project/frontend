/*
  Visualizer.js - 음악 시각화 실행 컴포넌트 (새 창 버전)
  -------------------------------------------------
  - audioUrl을 props로 받아 Three.js 기반의 시각화를 새 창에서 실행
  - window.open()을 사용하여 public/visualizer/index.html을 새 창에서 로드
  - React와 Three.js 코드의 충돌을 방지하면서 독립적으로 시각화를 유지
  - 팝업 차단 여부를 확인하고 새 창을 닫는 로직 포함
  - FFT 데이터를 시각화 창에서 분석 후 React로 전송
  - Gesture Control을 React 내부에서 실행하여 제스처 제어 가능
*/

import React, { useEffect, useRef } from "react";
import { cleanupVisualizerWindows, visualizerWindows } from "../utils/visualizerManager";

const Visualizer = ({ audioUrl, fileName }) => {
  const visualizerWindowRef = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    // 기존 열린 시각화 창 정리 
    cleanupVisualizerWindows();

    // 새 창에서 Three.js 기반 비주얼라이저 실행
    const visualizerUrl = `/visualizer/index.html?audioUrl=${encodeURIComponent(audioUrl)}&fileName=${encodeURIComponent(fileName)}`;
    console.log("🌐 새 창에서 시각화 실행:", visualizerUrl);

    const newVisualizerWindow = window.open(visualizerUrl, "_blank", "width=1200,height=800");

    if (newVisualizerWindow) {
      visualizerWindowRef.current = newVisualizerWindow;
      visualizerWindows.push(newVisualizerWindow);

      newVisualizerWindow.opener = window;

      const sendCloseMessage = () => {
        if (window.opener) {
          window.opener.postMessage({ type: "visualizerClosed" }, "*");
          console.log("🚪 시각화 창이 닫힘 → 부모 창에 visualizerClosed 메시지 전송!");
        }
      };

      newVisualizerWindow.addEventListener("beforeunload", sendCloseMessage);
      newVisualizerWindow.addEventListener("unload", sendCloseMessage);
    } else {
      console.error("❌ 팝업 차단으로 인해 새 창을 열 수 없습니다.");
      alert("🚨 팝업 차단을 허용해주세요!");
    }
    return () => {
      if (visualizerWindowRef.current && !visualizerWindowRef.current.closed) {
        visualizerWindowRef.current.close();
        window.opener?.postMessage({ type: "visualizerClosed" }, "*"); // 부모 창으로 메시지 전송
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const handleWebcamMessage = (event) => {
      if (event.data.type === "webcamOpened") {
        
        console.log("📡 웹캠 창 열림 메시지 수신됨");
      } else if (event.data.type === "webcamClosed") {
        
        console.log("📡 웹캠 창 닫힘 메시지 수신됨");
      }
    };
  
    window.addEventListener("message", handleWebcamMessage);
  
    return () => window.removeEventListener("message", handleWebcamMessage);
  }, []);

  // 제스처 데이터 수신 (webcam.html → visualizer 창)
  useEffect(() => {
    const handleGestureMessage = (event) => {
      if (event.data.action === "gesture") {
        const gesture = event.data.gesture;

        if (visualizerWindowRef.current && !visualizerWindowRef.current.closed) {
          visualizerWindowRef.current.postMessage({ action: "gesture", gesture }, "*");
        }
      }
    };

    window.addEventListener("message", handleGestureMessage);
    return () => window.removeEventListener("message", handleGestureMessage);
  }, []);

  // FFT 데이터를 시각화 창에서 분석 후 React로 전송
  useEffect(() => {
    const handleFFTResponse = (event) => {
      if (event.data.type === "fftData") {
        window.opener?.postMessage({ type: "fftData", value: event.data.value }, "*");
      }
    };

    window.addEventListener("message", handleFFTResponse);

    
    return () => {
    
      window.removeEventListener("message", handleFFTResponse);
    };
  }, []);
  

  return null; // 시각화는 새 창에서 실행되므로 UI 요소 렌더링 없음
};

export default Visualizer;


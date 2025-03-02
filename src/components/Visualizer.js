/**
 * Visualizer.js - React에서 음악 시각화를 실행하는 컴포넌트 (새 창 버전)
 *
 * - `audioUrl`을 props로 받아 Three.js 기반의 시각화를 새 창에서 실행
 * - `window.open()`을 사용하여 `public/visualizer/index.html`을 새 창에서 로드
 * - React와 Three.js 코드의 충돌을 방지하면서 원래의 시각화를 유지
 */

import React, { useEffect } from "react";
import { visualizerWindows } from "../utils/visualizerManager"; // ✅ 전역 배열 import

const Visualizer = ({ audioUrl }) => {
  useEffect(() => {
    if (!audioUrl) return; // 음악이 없으면 실행 안 함

    // React에서 전달된 audioUrl을 새 창에서 로드할 URL 파라미터로 추가
    const visualizerUrl = `/visualizer/index.html?audioUrl=${encodeURIComponent(audioUrl)}`;    

    console.log("🌐 새 창에서 시각화 화면 열기:", visualizerUrl); // 디버깅

    // 새 창에서 실행
    const newWindow = window.open(visualizerUrl, "_blank", "width=1200,height=800");

    if (!newWindow) {
      console.error("❌ 팝업 차단으로 인해 새 창을 열 수 없습니다.");
    } else {
      visualizerWindows.push(newWindow); // ✅ 전역 배열에 추가
    }

    // 새 창이 닫히면 상태 업데이트 (선택 사항)
    return () => {
      if (newWindow) newWindow.close();
    };
  }, [audioUrl]);

  return null; // 더 이상 iframe을 사용하지 않으므로 UI 렌더링 없음
};

export default Visualizer;

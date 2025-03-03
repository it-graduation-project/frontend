/*
  visualizerManager.js - 시각화 창 전역 관리 파일
  - 시각화 창(Visualizer.js에서 열리는 새 창)을 추적하고 닫을 수 있도록 관리함
  - 여러 컴포넌트(Navbar.js, FileUpload.js 등)에서 시각화 창을 제어할 수 있도록 전역 배열을 활용
  - 로그아웃 시, 음악 교체 시 기존 시각화 창을 자동으로 닫도록 기능 제공
*/

export const visualizerWindows = [];

// 열린 모든 시각화 창 닫기 (로그아웃, 음악 교체 시 호출됨)
export const closeAllVisualizerWindows = () => {
  visualizerWindows.forEach((win) => {
    if (win && !win.closed) {
      win.close();
    }
  });
  visualizerWindows.length = 0; // 배열 초기화
};

// 불필요한 창 제거 함수
export const cleanupVisualizerWindows = () => {
  for (let i = visualizerWindows.length - 1; i >= 0; i--) {
    if (!visualizerWindows[i] || visualizerWindows[i].closed) {
      visualizerWindows.splice(i, 1);
    }
  }
};
// 🔥 열린 시각화 창을 저장하는 전역 배열
export const visualizerWindows = [];

// 🔥 시각화 창 닫기 함수
export const closeAllVisualizerWindows = () => {
  visualizerWindows.forEach((win) => {
    if (win && !win.closed) {
      win.close();
    }
  });
  visualizerWindows.length = 0; // 배열 초기화
};

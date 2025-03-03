/*
  index.js - React 애플리케이션의 진입점
  -------------------------------------------------
  - `App.js`를 `index.html`의 `root` 요소에 렌더링
  - 글로벌 스타일 `common.css`를 적용하여 애플리케이션 전체 스타일 관리
  - React.StrictMode를 사용하여 개발 중 잠재적 문제 감지
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/common.css"; // 글로벌 스타일 적용

// React 애플리케이션을 #root 요소에 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

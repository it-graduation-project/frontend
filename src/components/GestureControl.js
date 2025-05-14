/*
    GestureControl.js - 웹캠 실행, 제스처 감지 기능 컴포넌트 (React)
    -------------------------------------------------
    - 웹캠 실행 및 Mediapipe를 이용한 손 제스처 감지
    - 주먹 감지: 손가락 간 거리 + 손가락이 접혀있는 상태 확인
    - 손바닥 감지: 손가락 간 거리 + 손가락이 손목보다 위에 있는지 확인
    - 연속해서 같은 제스처가 감지될 때만 부모 컴포넌트에 이벤트 전달
*/

import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";

const GestureControl = ({ onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("none");
  const cameraRef = useRef(null);
  const gestureBuffer = useRef([]); // 최근 제스처를 저장하여 연속 인식 방지

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn("🚨 videoRef 또는 canvasRef가 아직 초기화되지 않았습니다.");
      return;
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });

        const recognizedGesture = detectGesture(landmarks);
        updateGestureBuffer(recognizedGesture);
      }
    });

    if (videoRef.current) {
      const newCamera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      newCamera.start();
      cameraRef.current = newCamera;
    }

    return () => {
      console.log("🛑 Gesture Control 종료: 웹캠 정리");
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  // 손가락 간 거리 계산 함수
  const distance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
  };

  // 연속된 제스처 감지 방지 (버퍼 활용)
  const updateGestureBuffer = (newGesture) => {
    if (gestureBuffer.current.length >= 5) {
      gestureBuffer.current.shift(); // 오래된 값 제거
    }
    gestureBuffer.current.push(newGesture);

    // 연속 3번 이상 같은 값이 감지되면 적용
    const stableGesture = gestureBuffer.current.filter(g => g === newGesture).length >= 3;
    if (stableGesture && newGesture !== gesture) {
      setGesture(newGesture);
      if (onGestureDetected) {
        onGestureDetected(newGesture);
      }
    }
  };

  // 주먹 & 손바닥 감지 함수 
  const detectGesture = (landmarks) => {
    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const thumbTip = landmarks[4];

    // 손가락 끝 사이의 거리 계산
    const indexMiddleDist = distance(indexTip, middleTip);
    const middleRingDist = distance(middleTip, ringTip);
    const ringPinkyDist = distance(ringTip, pinkyTip);
    const thumbIndexDist = distance(thumbTip, indexTip);

    // 손가락이 접혀있는지 확인 (각도 고려)
    const isFist =
      indexMiddleDist < 0.05 &&
      middleRingDist < 0.05 &&
      ringPinkyDist < 0.05 &&
      thumbIndexDist < 0.06 &&
      indexTip.y > wrist.y && // 손가락이 손목 아래에 위치
      middleTip.y > wrist.y &&
      ringTip.y > wrist.y &&
      pinkyTip.y > wrist.y;

    // 손가락이 펴져있는지 확인 + 손목보다 위에 있는지 확인
    const isPalmOpen =
      indexMiddleDist > 0.1 &&
      middleRingDist > 0.1 &&
      ringPinkyDist > 0.1 &&
      thumbIndexDist > 0.1 &&
      indexTip.y < wrist.y && // 손가락이 손목보다 위에 위치
      middleTip.y < wrist.y &&
      ringTip.y < wrist.y &&
      pinkyTip.y < wrist.y;

    if (isFist) return "pause";
    if (isPalmOpen) return "play";
    return "none";
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} />
      <h2>🎵 현재 제스처: {gesture}</h2>
    </div>
  );
};

export default GestureControl;

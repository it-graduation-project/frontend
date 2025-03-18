/*
  bluetoothManager.js - 블루투스 연결 및 FFT 데이터 전송 관리 (Bluetooth Classic 버전)
  -------------------------------------------------
  - Web Serial API를 사용하여 ESP32와 연결
  - FFT 분석 데이터를 ESP32로 전송하여 진동 모터를 제어
  - 블루투스 연결 상태를 시각화 창과 동기화
*/

let serialPort = null;  // 🔥 Bluetooth Classic Serial Port
let serialWriter = null;  // 🔥 데이터 전송을 위한 writer
let isConnected = false;  
let fftStreamingInterval = null;

// ✅ Bluetooth Classic 연결 함수 (BLE 대신 Serial API 사용)
export const connectBluetoothClassic = async () => {
  try {
    console.log("🔍 Searching for Bluetooth Classic device...");

    // ✨ HTTPS 환경 체크 (Serial API는 HTTPS에서만 동작)
    if (window.isSecureContext === false) {
      console.error("❌ Bluetooth Classic requires HTTPS. Please use a secure connection.");
      alert("🚨 Bluetooth Classic requires HTTPS. Please access the site via HTTPS.");
      return false;
    }

    // ✨ 기존 Serial 연결이 있으면 먼저 해제
    if (serialPort) {
      console.warn("⚠️ Existing Bluetooth Classic device found. Disconnecting...");
      disconnectBluetoothClassic();
    }

    // ✅ Bluetooth Classic 장치 검색 (ESP32 전용 필터 추가)
    console.log("📡 Requesting Bluetooth Serial device...");
    serialPort = await navigator.serial.requestPort(); // ❗ 필터 제거

    if (!serialPort) {
      console.error("❌ No compatible device found!");
      alert("🚨 No compatible Bluetooth Classic device found. Please check your connection.");
      return false;
    }

    // ✅ Serial 포트 열기 (Baudrate 설정)
    await serialPort.open({ baudRate: 230400 });

    serialWriter = serialPort.writable.getWriter(); // ✅ 데이터 전송을 위한 writer 생성
    isConnected = true;

    console.log("✅ Web Serial 연결 성공!");

    notifyVisualizer("connected");

    return true;
  } catch (error) {
    console.error("❌ Bluetooth Classic connection failed:", error);
    return false;
  }
};

// ✅ Bluetooth Classic 연결 해제 함수
export const disconnectBluetoothClassic = async () => {
  if (serialWriter) {
    await serialWriter.close();
    serialWriter = null;
  }
  if (serialPort) {
    const reader = serialPort.readable.getReader();
    await reader.cancel(); // ✅ 읽기 작업 중단
    await reader.releaseLock(); // ✅ 리소스 해제
    await serialPort.close();
    serialPort = null;
  }
  
  isConnected = false;
  stopStreamingFFTData();
  notifyVisualizer("disconnected");

  console.log("🔴 Bluetooth Classic 연결 해제됨");
};

// ✅ FFT 데이터를 ESP32로 전송하는 함수 (BLE → Serial Write 변경)
let previousFFTValue = 0; // 🔥 이전 FFT 값을 저장하는 전역 변수 추가

export const sendFFTDataToESP32 = async (value) => {
  if (!isConnected || !serialWriter) return;

  try {
      let diff = value - previousFFTValue; // 🔥 변화량 (부호 포함)
      let pulsedValue;

      // 조절요소
      // ✅ 변화량이 7 미만이면 전송 생략 (Serial 과부하 방지)
      if (Math.abs(diff) < 7) {
          return; // ❌ write() 호출하지 않음
      }

      // ✅ 비트가 강해질 때 (⬆ 상승, diff > 0) → 진동을 더 극대화
      if (diff > 0) {  
          pulsedValue = Math.min(255, Math.floor(value * 2.4)); // 최대값 255 제한
      }
      // ✅ 비트가 약해질 때 (⬇ 하강, diff < 0) → 진동을 극적으로 낮춤
      else { 
          pulsedValue = Math.max(5, Math.floor(value * 0.3)); // 최소값 5 제한
      }

      let data = new Uint8Array([pulsedValue]);  // ✅ 단일 값만 전송
      await serialWriter.write(data); // ✅ Bluetooth Classic Serial Write 사용
      console.log(`value: ${value} / pulsedValue: ${pulsedValue}, 변화량: ${diff}`);

      previousFFTValue = value; // ✅ 현재 값을 저장해서 다음 호출 시 비교 기준으로 사용
  } catch (error) {
      console.error("❌ FFT 데이터 전송 실패:", error);
  }
};

// ✅ FFT 데이터 스트리밍 시작
export const startStreamingFFTData = () => {
  if (!isConnected || fftStreamingInterval) return;

  console.log("🎵 Starting FFT Data Streaming...");
  fftStreamingInterval = setInterval(() => {
    window.postMessage({ type: "requestFFT" }, "*");
  }, 10); // 조절요소
};

// ✅ FFT 데이터 스트리밍 중단
export const stopStreamingFFTData = () => {
  if (fftStreamingInterval) {
    clearInterval(fftStreamingInterval);
    fftStreamingInterval = null;
    console.log("⏹️ Stopped FFT Data Streaming.");
  }
};

// ✅ 블루투스 연결 상태 반환
export const getBluetoothStatus = () => {
  return isConnected && serialPort !== null;
};

// ✅ 시각화 창에 블루투스 상태 전달 (PostMessage)
function notifyVisualizer(status) {
  // 기존 창이 열려 있는지 확인 후 메시지 전송
  const visualizerWindows = window.visualizerWindows || [];
  
  if (visualizerWindows.length > 0) {
    visualizerWindows.forEach(win => {
      if (win && !win.closed) {
        win.postMessage({ type: "bluetoothStatus", status }, "*");
      }
    });
  } else {
    console.warn("⚠️ No visualizer window open. Skipping message.");
  }
}

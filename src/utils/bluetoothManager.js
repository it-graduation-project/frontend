/*
  bluetoothManager.js - 블루투스 연결 및 FFT 데이터 전송 관리
  -------------------------------------------------
  - Web Bluetooth API를 사용하여 ESP32와 연결
  - FFT 분석 데이터를 ESP32로 전송하여 진동 모터를 제어
  - 블루투스 연결 상태를 시각화 창과 동기화
*/

let bluetoothDevice = null;
let bluetoothServer = null;
let bluetoothCharacteristic = null;
let isConnected = false;
let fftStreamingInterval = null;

// ✅ 블루투스 연결 함수
export const connectBluetooth = async () => {
  try {
    console.log("🔍 Searching for ESP32 Bluetooth device...");

    // ✨ 기존 블루투스 연결이 있으면 먼저 해제
    if (bluetoothDevice) {
      console.warn("⚠️ Existing Bluetooth device found. Disconnecting...");
      disconnectBluetooth();
    }

    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["12345678-1234-5678-1234-56789abcdef0"],
    });

    bluetoothDevice.addEventListener("gattserverdisconnected", handleDisconnect); // ✅ 연결 끊김 감지 추가

    bluetoothServer = await bluetoothDevice.gatt.connect();
    const service = await bluetoothServer.getPrimaryService("12345678-1234-5678-1234-56789abcdef0");
    bluetoothCharacteristic = await service.getCharacteristic("abcd1234-5678-9876-5432-10abcdef1234");

    isConnected = true;
    console.log("✅ Connected to device:", bluetoothDevice.name);
    notifyVisualizer("connected");
    
    return true;
  } catch (error) {
    console.error("❌ Bluetooth connection failed:", error);
    return false;
  }
};

// ✅ 블루투스 연결 해제 함수
export const disconnectBluetooth = async () => {
  if (bluetoothDevice) {
    console.log("🔴 Disconnecting Bluetooth...");

    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }

    bluetoothDevice = null;  // ✅ 기존 블루투스 객체 초기화
  }

  isConnected = false;
  stopStreamingFFTData();
  notifyVisualizer("disconnected");

  // ✨ BLE Adapter를 강제 리프레시하여 ESP32가 다시 검색되도록 함
  const available = await navigator.bluetooth.getAvailability();
  if (available) {
    console.log("🔄 Bluetooth adapter refreshed. Ready for reconnection.");
  } else {
    console.warn("⚠️ Bluetooth adapter not available.");
  }
};

// ✅ 연결 끊김 감지 핸들러 (자동 재연결 방지)
function handleDisconnect() {
  console.warn("⚠️ Bluetooth connection lost!");
  isConnected = false;
  notifyVisualizer("disconnected");

  // ✨ 자동 재연결을 막고, 새로운 기기 검색을 위해 기존 객체 제거
  bluetoothDevice = null;
}

// ✅ FFT 데이터를 ESP32로 전송하는 함수
let previousFFTValue = 0; // 🔥 이전 FFT 값을 저장하는 전역 변수 추가

export const sendFFTDataToESP32 = async (value) => {
  if (!isConnected || !bluetoothCharacteristic) return;

  try {
      let diff = value - previousFFTValue; // 🔥 변화량 (부호 포함)
      let pulsedValue;

      // ✅ 변화량이 10 미만이면 전송 생략 (BLE 과부하 방지)
      if (Math.abs(diff) < 10) {
          return; // ❌ writeValue() 호출하지 않음
      }

      // ✅ 비트가 강해질 때 (⬆ 상승, diff > 0) → 진동을 더 극대화
      if (diff > 0) {  
          pulsedValue = Math.min(255, Math.floor(value * 2)); // 최대값 255 제한
      }
      // ✅ 비트가 약해질 때 (⬇ 하강, diff < 0) → 진동을 극적으로 낮춤
      else { 
          pulsedValue = Math.max(5, Math.floor(value * 0.3)); // 최소값 5 제한
      }

      let data = new Uint8Array([pulsedValue]);
      await bluetoothCharacteristic.writeValue(data);
      console.log(`🔵 value: ${value} / pulsedValue: ${pulsedValue}, 변화량: ${diff}`);

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
  }, 100);
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
  return isConnected && bluetoothDevice?.gatt?.connected;
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

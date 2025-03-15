/*
  scripts.js - Three.js 기반 음악 시각화 스크립트
  -------------------------------------------------
  - WebGL을 활용한 음악 시각화를 담당하는 스크립트
  - Three.js를 사용하여 3D 객체와 후처리 효과 적용
  - Web Audio API와 연동하여 음악 분석 및 시각적 반응 구현
  - 사용자 인터랙션 (재생/정지 버튼, 마우스 입력, GUI 조절) 지원
  - FFT 데이터를 React로 전달하여 Bluetooth Classic을 통해 ESP32에 전송
*/

console.log("✅ scripts.js 실행됨!");


import * as THREE from "three";
import { GUI } from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

// FFT 데이터를 React로 전송하는 함수
function sendFFTDataToReact(value) {
    window.opener?.postMessage({ type: "fftData", value }, "*");
}

// FFT 분석을 통해 데이터를 React로 전달
function detectBeat() {
    if (!analyser) return;

    let frequencyValue = analyser.getAverageFrequency(); // ✅ 원본 FFT 값 유지
    sendFFTDataToReact(frequencyValue); // ✅ 변형 없이 그대로 React로 전송
}

let fftInterval = null;

function startFFTStreaming() {
    if (fftInterval) return;  // 이미 실행 중이면 중복 실행 방지

    console.log("🎵 FFT 데이터 스트리밍 시작!");
    fftInterval = setInterval(() => {
        if (isPlaying) detectBeat(); // ✅ 음악이 재생 중일 때만 FFT 데이터 전송
    }, 10); // 조절요소
}

function stopFFTStreaming() {
    if (fftInterval) {
        clearInterval(fftInterval);
        fftInterval = null;
        console.log("⏹ FFT 데이터 스트리밍 중지!");
    }
}

// Three.js 렌더러 설정
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// 카메라 설정 (원근 투영)
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// 블룸 효과를 위한 파라미터
const params = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    threshold: 0.5,
    strength: 0.5,
    radius: 0.8
};

renderer.outputColorSpace = THREE.SRGBColorSpace;

// 후처리 효과 설정 (렌더 패스 + 블룸 효과)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight));
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const outputPass = new ShaderPass(CopyShader);
bloomComposer.addPass(outputPass);

// 카메라 위치 및 초기 시점 설정
camera.position.set(0, -2, 14);
camera.lookAt(0, 0, 0);

// 셰이더 유니폼 변수 설정
const uniforms = {
    u_time: { type: 'f', value: 0.0 },
    u_frequency: { type: 'f', value: 0.0 },
    u_red: { type: 'f', value: 1.0 },
    u_green: { type: 'f', value: 1.0 },
    u_blue: { type: 'f', value: 1.0 }
};

// 3D 오브젝트 생성 (이코사헤드론)
const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
});

const geo = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
mesh.material.wireframe = true;

// 오디오 설정
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
let analyser = null; 
let currentPlaybackTime = 0;
let isPlaying = false;
let audioContextStartTime = 0; // 추가

// 로딩/재생/정지 버튼 생성 및 스타일 설정
const playPauseButton = document.createElement("button");
playPauseButton.textContent = "Loading";
playPauseButton.style.position = "absolute";
playPauseButton.style.top = "30px";  
playPauseButton.style.left = "30px"; 
playPauseButton.style.transform = "none"; 
playPauseButton.style.padding = "20px 40px";
playPauseButton.style.fontSize = "24px";
playPauseButton.style.fontWeight = "bold";
playPauseButton.style.backgroundColor = "gray"; // 로딩 중일 때 비활성화
playPauseButton.style.color = "white";
playPauseButton.style.border = "none";
playPauseButton.style.cursor = "not-allowed";
document.body.appendChild(playPauseButton);

// Gesture Control ON/OFF 버튼 생성 (초기 상태: ON)
const gestureControlButton = document.createElement("button");
gestureControlButton.textContent = "Gesture Control ON";  // 기본 상태
gestureControlButton.style.position = "absolute";
gestureControlButton.style.top = "30px";
gestureControlButton.style.left = "200px";
gestureControlButton.style.padding = "20px 40px";
gestureControlButton.style.fontSize = "24px";
gestureControlButton.style.fontWeight = "bold";
gestureControlButton.style.backgroundColor = "purple";  // ON 상태일 때 보라색
gestureControlButton.style.color = "white";
gestureControlButton.style.border = "none";
gestureControlButton.style.cursor = "pointer";
document.body.appendChild(gestureControlButton);

let webcamWindow = null; // 웹캠 창 저장

// 🟣 Gesture Control 버튼 클릭 시 웹캠 새 창 실행 or 종료
gestureControlButton.addEventListener("click", () => {
    if (webcamWindow && !webcamWindow.closed) {
        // 웹캠 창이 열려 있다면 종료
        webcamWindow.close();
        webcamWindow = null;
        gestureControlButton.textContent = "Gesture Control ON";
        gestureControlButton.style.backgroundColor = "purple";
        console.log("🛑 Gesture Control 종료");

        // 웹캠 종료됨 메시지 React로 전송 
        window.opener?.postMessage({ type: "webcamClosed" }, "*");
    } else {
        // 웹캠 창 새로 열기
        webcamWindow = window.open("/visualizer/webcam.html", "_blank", "width=400,height=300");

        if (webcamWindow) {
            gestureControlButton.textContent = "Gesture Control OFF";
            gestureControlButton.style.backgroundColor = "gray";
            console.log("✅ Gesture Control 실행");

            // 웹캠 열림 메시지 React로 전송 
            window.opener?.postMessage({ type: "webcamOpened" }, "*");
        } else {
            console.error("❌ 팝업 차단으로 인해 새 창을 열 수 없습니다.");
            alert("🚨 팝업 차단을 허용해주세요!");
        }
    }
});

// 🛑 시각화 창 닫힐 때 웹캠 창 자동 닫기
window.addEventListener("beforeunload", () => {
    if (webcamWindow && !webcamWindow.closed) {
        console.log("🚪 부모 창 닫힘 → 웹캠 창 자동 종료");
        webcamWindow.close();
        webcamWindow = null;
    }
});


// JWT 토큰을 포함하여 서버에서 오디오 파일 가져오기
const fetchAudioWithJWT = async (url) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.error("❌ JWT 토큰이 없습니다.");
        return null;
    }

    try {
        console.log("📡 오디오 파일 요청 중:", url);
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("✅ 서버 응답 상태 코드:", response.status);

        if (!response.ok) {
            throw new Error(`❌ 서버 응답 오류! 상태 코드: ${response.status}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("❌ 오디오 파일 로드 실패:", error);
        return null;
    }
};

// 오디오 로드 및 버튼 활성화
const urlParams = new URLSearchParams(window.location.search);
const storedAudioUrl = urlParams.get("audioUrl");

window.onload = async function () {
    if (!storedAudioUrl) {
        console.error("🛑 파일 URL이 없습니다.");
        return;
    }

    console.log("🟢 Web Audio API에서 사용될 파일 URL:", storedAudioUrl);

    const blobUrl = await fetchAudioWithJWT(storedAudioUrl);
    if (!blobUrl) {
        console.error("❌ 블롭 URL 생성 실패!");
        return;
    }

    const audioLoader = new THREE.AudioLoader();

    audioLoader.load(blobUrl, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);

        analyser = new THREE.AudioAnalyser(sound, 256);
        console.log("🎛 AudioAnalyser 생성 완료!");

        // 버튼 활성화
        playPauseButton.textContent = "Play";
        playPauseButton.style.backgroundColor = "#28a745";
        playPauseButton.style.cursor = "pointer";

        let audioContextStartTime = 0; // 오디오 재생 시작 시간

        });
};

// 음악 재생
function playMusic() {
    if (playPauseButton.textContent === "Replay") {
        console.log("🔄 Replay 버튼 클릭됨 → 음악 처음부터 재생");
        sound.stop();
        currentPlaybackTime = 0;

        // 🎨 Replay 버튼 스타일 초기화 (Play 버튼처럼 변경)
        playPauseButton.textContent = "Stop";
        playPauseButton.style.backgroundColor = "#dc3545"; 
        playPauseButton.style.color = "white";
    }

    if (sound.isPlaying) return;
    console.log("▶ 음악 재생");
    sound.offset = currentPlaybackTime;
    sound.play();
    audioContextStartTime = sound.context.currentTime - currentPlaybackTime;
    isPlaying = true;
    animate();

    startFFTStreaming(); // ✅ 음악 재생 시 FFT 데이터 전송 시작

    // React에 재생 상태 전달
    window.opener?.postMessage({ type: "musicStatus", status: "playing" }, "*");

    playPauseButton.textContent = "Stop";
    playPauseButton.style.backgroundColor = "#dc3545";
    playPauseButton.style.color = "white";
}

// 음악 정지
function pauseMusic() {
    if (!sound.isPlaying) return;
    console.log("⏸ 음악 정지");
    currentPlaybackTime = sound.context.currentTime - audioContextStartTime;
    sound.stop();
    isPlaying = false;

    stopFFTStreaming(); // ✅ 음악 정지 시 FFT 데이터 전송 중단

    // React에 정지 상태 전달
    window.opener?.postMessage({ type: "musicStatus", status: "paused" }, "*");

    playPauseButton.textContent = "Play";
    playPauseButton.style.backgroundColor = "#28a745";
    playPauseButton.style.color = "white";
}

// Play/Pause 버튼 이벤트
playPauseButton.addEventListener("click", () => isPlaying ? pauseMusic() : playMusic());

// 음악 종료 시 Replay 버튼으로 변경 (재생 중에는 실행 안 됨)
sound.onEnded = function () {
    if (!isPlaying) return; // 종료 이벤트 중복 방지

    console.log("🎵 음악이 끝났습니다. Replay 버튼으로 변경");

    playPauseButton.textContent = "Replay";
    playPauseButton.style.backgroundColor = "#60A5FA"; 
    playPauseButton.style.color = "white";
    playPauseButton.style.cursor = "pointer";

    isPlaying = false;
    currentPlaybackTime = 0; // 재생 위치 초기화
};


// 제스처 이벤트 감지 (웹캠 창에서 신호 수신)
window.addEventListener("message", (event) => {
    if (event.data.action === "gesture") {
        console.log(`📩 제스처 감지: ${event.data.gesture}`);
        if (event.data.gesture === "play") playMusic();
        if (event.data.gesture === "pause") pauseMusic();
    }
});

// 웹캠 창이 닫히면 자동 정리
setInterval(() => {
    if (webcamWindow && webcamWindow.closed) {
        webcamWindow = null;
        gestureControlButton.textContent = "Gesture Control ON";
        gestureControlButton.style.backgroundColor = "purple";
    }
}, 1000);


// 초기 장면을 렌더링 (흰 화면 방지)
function initialRender() {
    bloomComposer.render();
}
initialRender();

// 애니메이션 루프 (재생 중일 때만 실행)
const clock = new THREE.Clock();
let animateFrameId;
// let lastFrameTime = performance.now(); // 🔥 마지막 프레임 시간 저장

function animate() {
    if (!isPlaying) return;
    animateFrameId = requestAnimationFrame(animate);

    // let now = performance.now();
    // let frameTime = now - lastFrameTime; // 🔥 프레임 간격(ms) 계산
    // lastFrameTime = now;

    // console.log(`🎨 시각화 애니메이션 업데이트 간격: ${frameTime.toFixed(2)}ms`);

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.5;
    camera.lookAt(scene.position);

    uniforms.u_time.value = clock.getElapsedTime();

    if (analyser && sound.isPlaying) {
        const frequencyValue = analyser.getAverageFrequency();
        if (frequencyValue > 0) {
            // 조절요소
            let enhancedValue = Math.pow(frequencyValue / 255, 1.3) * 300; // 기존보다 변화량 증폭
            uniforms.u_frequency.value = enhancedValue;
        }
    }

    bloomComposer.render();
}

// 시각화 설정 유지
const gui = new GUI();
console.log("📟 GUI 패널 생성 완료");

// 색상 조절
const colorsFolder = gui.addFolder('Colors');
colorsFolder.add(params, 'red', 0, 1).onChange(value => uniforms.u_red.value = Number(value));
colorsFolder.add(params, 'green', 0, 1).onChange(value => uniforms.u_green.value = Number(value));
colorsFolder.add(params, 'blue', 0, 1).onChange(value => uniforms.u_blue.value = Number(value));

// 블룸 효과 조절
const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(params, 'threshold', 0, 1).onChange(value => bloomPass.threshold = Number(value));
bloomFolder.add(params, 'strength', 0, 3).onChange(value => bloomPass.strength = Number(value));
bloomFolder.add(params, 'radius', 0, 1).onChange(value => bloomPass.radius = Number(value));

// 마우스 이벤트 디버깅
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

// 창 크기 변경 이벤트 핸들러
window.addEventListener('resize', function() {
    // console.log("📏 창 크기 변경 감지됨!");
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);

    if (!isPlaying) {
        console.log("🖼️ 창 크기 변경 시 마지막 프레임 유지");
        bloomComposer.render();
    }
});

// 부모 창(Navbar)에서 로그아웃 시 메시지로 웹캠 창 닫기
window.addEventListener("message", (event) => {
    if (event.data.action === "closeWebcam") {
        if (webcamWindow && !webcamWindow.closed) {
            webcamWindow.close();
            webcamWindow = null;
            gestureControlButton.textContent = "Gesture Control ON";
            gestureControlButton.style.backgroundColor = "purple";
            console.log("🚪 메시지 수신 → 웹캠 창 자동 종료");
        }
    }
});

// 시각화 창 닫힐 시 웹캠 창도 닫힐 수 있도록 설정
window.addEventListener('unload', () => {
    if (webcamWindow && !webcamWindow.closed) {
        webcamWindow.close();
        webcamWindow = null;
        console.log("🚪 시각화 창 닫힘 → 웹캠 창 자동 종료");
    }
}); 

// React에서 블루투스 상태를 받을 수 있도록 설정
window.addEventListener("message", (event) => {
    if (event.data.type === "bluetoothStatus") {
        console.log(`💡 Bluetooth Status: ${event.data.status}`);
    }
});
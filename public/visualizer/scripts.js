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

const playIconSrc = "/visualizer/images/play_icon.png";
const pauseIconSrc = "/visualizer/images/pause_icon.png";
const replayIconSrc = "/visualizer/images/replay_icon.png";
const gestureCameraIconSrc = `${window.location.origin}/visualizer/images/gesture_camera.png`;

// Controls 패널 삭제 문제 해결
setTimeout(() => {
    const controlsContainer = document.querySelector(".dg.main");
    if (controlsContainer) {
        controlsContainer.remove();
    }
}, 500);

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

// Gesture Control 토글 버튼 생성
const gestureControlContainer = document.createElement("div");
gestureControlContainer.style.position = "absolute";
gestureControlContainer.style.top = "20px";
gestureControlContainer.style.right = "20px";
gestureControlContainer.style.display = "flex";
gestureControlContainer.style.alignItems = "center";
gestureControlContainer.style.gap = "10px";
gestureControlContainer.style.fontFamily = "Arial, Helvetica, sans-serif";
gestureControlContainer.style.padding = "8px 15px";
gestureControlContainer.style.borderRadius = "12px";  // 둥근 사각형 형태로 변경
gestureControlContainer.style.border = "1px solid rgba(255, 255, 255, 0.5)";  // 흰색 테두리 추가
gestureControlContainer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";  // 반투명 배경 추가

const gestureLabel = document.createElement("span");
gestureLabel.textContent = "Gesture Control ";
gestureLabel.style.color = "white";
gestureLabel.style.fontSize = "18px";
gestureLabel.style.fontWeight = "600";

const gestureCameraIcon = document.createElement("img");
gestureCameraIcon.src = gestureCameraIconSrc;
gestureCameraIcon.style.width = "28px";
gestureCameraIcon.style.height = "28px";

// 토글 버튼 생성
const gestureToggleWrapper = document.createElement("label");
gestureToggleWrapper.style.display = "inline-flex";
gestureToggleWrapper.style.alignItems = "center";
gestureToggleWrapper.style.cursor = "pointer";

const gestureToggle = document.createElement("input");
gestureToggle.type = "checkbox";
gestureToggle.style.display = "none";

const gestureToggleTrack = document.createElement("div");
gestureToggleTrack.style.width = "50px";
gestureToggleTrack.style.height = "25px";
gestureToggleTrack.style.backgroundColor = "#555";
gestureToggleTrack.style.borderRadius = "50px";
gestureToggleTrack.style.position = "relative";
gestureToggleTrack.style.transition = "background 0.3s";

const gestureCircle = document.createElement("div");
gestureCircle.style.width = "20px";
gestureCircle.style.height = "20px";
gestureCircle.style.backgroundColor = "white";
gestureCircle.style.borderRadius = "50%";
gestureCircle.style.position = "absolute";
gestureCircle.style.top = "50%";
gestureCircle.style.left = "5px";
gestureCircle.style.transform = "translateY(-50%)";
gestureCircle.style.transition = "left 0.3s";

gestureToggleWrapper.appendChild(gestureToggle);
gestureToggleTrack.appendChild(gestureCircle);
gestureToggleWrapper.appendChild(gestureToggleTrack);
gestureControlContainer.appendChild(gestureLabel);
gestureControlContainer.appendChild(gestureCameraIcon);
gestureControlContainer.appendChild(gestureToggleWrapper);
document.body.appendChild(gestureControlContainer);

let webcamWindow = null; // 웹캠 창 저장
let webcamCheckInterval = null; // 웹캠 상태 감지 setInterval 변수

// 🟣 Gesture Control 토글 버튼을 사용하여 웹캠 ON/OFF 제어
gestureToggle.addEventListener("change", () => {
    if (gestureToggle.checked) {
        // 🟢 제스처 컨트롤 활성화 → 웹캠 창 열기
        gestureToggleTrack.style.backgroundColor = "#B799FF"; // 활성화 시 연보라색
        gestureCircle.style.left = "25px";
        console.log("✅ Gesture Control 활성화");

        // 웹캠 창 열기
        webcamWindow = window.open("/visualizer/webcam.html", "_blank", "width=400,height=300");

        if (webcamWindow) {
            window.opener?.postMessage({ type: "webcamOpened" }, "*");
            
            // 새로운 웹캠 감지 setInterval 시작
            if (webcamCheckInterval) clearInterval(webcamCheckInterval); // 기존 interval 제거
            webcamCheckInterval = setInterval(() => {
                if (webcamWindow && webcamWindow.closed) {
                    console.log("🚪 웹캠 창이 닫혔습니다. Gesture Control OFF로 변경!");
                    gestureToggle.checked = false;
                    gestureToggleTrack.style.backgroundColor = "#555"; // 회색 OFF 상태
                    gestureCircle.style.left = "5px";
                    webcamWindow = null; // 웹캠 창 객체 초기화
                    clearInterval(webcamCheckInterval); // 더 이상 감지할 필요 없음

                    // React 또는 부모 창으로 메시지 전송 
                    window.opener?.postMessage({ type: "webcamClosed" }, "*");
                }
            }, 1000);
        } else {
            console.error("❌ 팝업 차단으로 인해 새 창을 열 수 없습니다.");
            alert("🚨 팝업 차단을 허용해주세요!");
            // 팝업이 차단된 경우 토글을 원래대로 되돌림
            gestureToggle.checked = false;
            gestureToggleTrack.style.backgroundColor = "#555";
            gestureCircle.style.left = "5px";
        }
    } else {
        // 🔴 제스처 컨트롤 비활성화 → 웹캠 창 닫기
        gestureToggleTrack.style.backgroundColor = "#555"; // 비활성화 시 회색
        gestureCircle.style.left = "5px";
        console.log("🛑 Gesture Control 비활성화");

        if (webcamWindow && !webcamWindow.closed) {
            webcamWindow.close();
            webcamWindow = null;
        }

         // 기존 감지 interval 제거
         if (webcamCheckInterval) {
            clearInterval(webcamCheckInterval);
            webcamCheckInterval = null;
        }

        window.opener?.postMessage({ type: "webcamClosed" }, "*");
    }
});

// 시각화 창 닫힐 때 웹캠 창 자동 닫기
window.addEventListener("beforeunload", () => {
    if (webcamWindow && !webcamWindow.closed) {
        console.log("🚪 부모 창 닫힘 → 웹캠 창 자동 종료");
        webcamWindow.close();
        webcamWindow = null;
    }

    // 닫히지 않는 경우를 대비해 500ms 후에도 한 번 더 확인
    setTimeout(() => {
        if (webcamWindow && !webcamWindow.closed) {
            console.log("⏳ 웹캠 창이 닫히지 않아 다시 시도!");
            webcamWindow.close();
            webcamWindow = null;
        }
    }, 500);
});

// Play/Pause 버튼 생성
const playPauseButton = document.createElement("div");
playPauseButton.style.position = "absolute";
playPauseButton.style.top = "20px";
playPauseButton.style.left = "20px";
playPauseButton.style.width = "45px";
playPauseButton.style.height = "45px";
playPauseButton.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
playPauseButton.style.border = "2px solid rgba(255, 255, 255, 0.2)";
playPauseButton.style.borderRadius = "50%";
playPauseButton.style.display = "flex";
playPauseButton.style.alignItems = "center";
playPauseButton.style.justifyContent = "center";
playPauseButton.style.cursor = "pointer";

const playPauseIcon = document.createElement("img");
playPauseIcon.src = playIconSrc;
playPauseIcon.style.width = "20px";
playPauseIcon.style.height = "20px";

playPauseButton.appendChild(playPauseIcon);
document.body.appendChild(playPauseButton);

// 음악 재생
function playMusic() {
    // 🔄 Replay 버튼 클릭 시 처음부터 재생
    if (playPauseIcon.src === window.location.origin + replayIconSrc) {
        console.log("🔄 Replay 버튼 클릭됨 → 음악 처음부터 재생");
        sound.stop();
        currentPlaybackTime = 0;
    }

    if (sound.isPlaying) return;
    console.log("▶ 음악 재생");
    sound.offset = currentPlaybackTime;
    sound.play();
    audioContextStartTime = sound.context.currentTime - currentPlaybackTime;
    isPlaying = true;
    animate();

    startFFTStreaming(); // FFT 데이터 전송 시작

    // 버튼을 Pause 아이콘으로 변경
    playPauseIcon.src = pauseIconSrc;

    // React에 재생 상태 전달
    window.opener?.postMessage({ type: "musicStatus", status: "playing" }, "*");
}

// 음악 정지
function pauseMusic() {
    if (!sound.isPlaying) return;
    console.log("⏸ 음악 정지");
    currentPlaybackTime = sound.context.currentTime - audioContextStartTime;
    sound.stop();
    isPlaying = false;

    stopFFTStreaming(); // ✅ FFT 데이터 전송 중단

    // 🎨 버튼을 Play 아이콘으로 변경
    playPauseIcon.src = playIconSrc;

    // React에 정지 상태 전달
    window.opener?.postMessage({ type: "musicStatus", status: "paused" }, "*");
}

// Play/Pause 버튼 이벤트
playPauseButton.addEventListener("click", () => {
    isPlaying ? pauseMusic() : playMusic();
});


// 음악 종료 시 Replay 버튼으로 변경 (재생 중에는 실행 안 됨)
sound.onEnded = function () {
    if (!isPlaying) return; // 종료 이벤트 중복 방지

    console.log("🎵 음악이 끝났습니다. Replay 버튼으로 변경");

    playPauseIcon.src = replayIconSrc;
    isPlaying = false;
    currentPlaybackTime = 0; // 재생 위치 초기화
};

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

        // 🔹 React에서 받은 파일명을 사용하도록 수정
    if (window.fileName) {
        document.title = `Now Playing: ${window.fileName}`;
    } else {
        document.title = "Now Playing: Unknown File"; // 예외 처리
    }


    const audioLoader = new THREE.AudioLoader();

    audioLoader.load(blobUrl, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);

        analyser = new THREE.AudioAnalyser(sound, 256);
        console.log("🎛 AudioAnalyser 생성 완료!");

        // 버튼 활성화
        playPauseButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        playPauseButton.style.borderRadius = "50%";
        playPauseButton.style.display = "flex";
        playPauseButton.style.alignItems = "center";
        playPauseButton.style.justifyContent = "center";

        // ✅ 기존 아이콘을 유지하면서 play 아이콘만 보이게 변경
        playPauseIcon.src = playIconSrc;

        let audioContextStartTime = 0; // 오디오 재생 시작 시간

        });
};

// 제스처 이벤트 감지 (웹캠 창에서 신호 수신)
window.addEventListener("message", (event) => {
    if (event.data.action === "gesture") {
        console.log(`📩 제스처 감지: ${event.data.gesture}`);
        if (event.data.gesture === "play") playMusic();
        if (event.data.gesture === "pause") pauseMusic();
    }
});

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
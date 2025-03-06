/*
  scripts.js - Three.js 기반 음악 시각화 스크립트
  -------------------------------------------------
  - WebGL을 활용한 음악 시각화를 담당하는 스크립트
  - Three.js를 사용하여 3D 객체와 후처리 효과 적용
  - Web Audio API와 연동하여 음악 분석 및 시각적 반응 구현
  - 사용자 인터랙션 (재생/정지 버튼, 마우스 입력, GUI 조절) 지원
  - FFT 데이터를 React로 전달하여 블루투스 제어 가능
*/

console.log("✅ scripts.js 실행됨!");

import * as THREE from "three";
import { GUI } from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

// ✅ FFT 데이터를 React로 전송하는 함수
function sendFFTDataToReact(value) {
    window.opener?.postMessage({ type: "fftData", value }, "*");
}

// ✅ FFT 분석을 통해 데이터를 React로 전달
function detectBeat() {
    if (!analyser) return;

    let freqData = analyser.getFrequencyData();
    let sum = 0;
    let count = 0;

    // 50Hz ~ 200Hz 대역의 평균값 계산
    for (let i = 5; i < 20; i++) {
        sum += freqData[i];
        count++;
    }
    let avg = sum / count;

    // ✅ React에 FFT 데이터 전달
    sendFFTDataToReact(avg);
}

// ✅ 100ms마다 FFT 분석 후 React로 데이터 전송
setInterval(() => {
    detectBeat();
}, 100);

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

        playPauseButton.addEventListener("click", async() => {
            if (playPauseButton.textContent === "Replay") {
                // 음악 처음부터 다시 재생
                console.log("🔄 음악 다시 재생");

                // 오디오가 이미 실행 중이라면 정지
                if (sound.isPlaying) {
                    sound.stop();
                    await new Promise(resolve => setTimeout(resolve, 50)); // 비동기적 대기를 통해 정확한 음악 재생
                }

                currentPlaybackTime = 0; // 처음부터 재생하기 위한 셋업
                sound.offset = 0; // 0초부터 시작 강제 지정
                sound.play(); // 재생 실행

                setTimeout(() => { 
                    /*
                        - Web Audio Api의 비동기적 특성으로 `sound.play()` 실행 직후 `context.currentTime`을 읽으면 부정확할 수 있음
                        → setTimeout() 사용해 실제 오디오가 재생된 후 정확한 재생 시간 기록 + 사용자의 버튼 연타 시 발생하는 버그 수정
                    */
                    audioContextStartTime = sound.context.currentTime; // play() 실행 이후 정확한 시간 기록
                    console.log(`🎯 audioContextStartTime이 0초로 설정됨`);
                }, 50);
                
                isPlaying = true;
                animate(); 
        
                playPauseButton.textContent = "Stop"; // 정지 버튼으로 변경
                playPauseButton.style.backgroundColor = "#dc3545"; 
                
            } else if (!isPlaying) {
                // ▶ 재생 모드
                if (sound.context.state === "suspended") {
                    sound.context.resume().then(() => {
                        sound.offset = currentPlaybackTime;
                        sound.play();
                        audioContextStartTime = sound.context.currentTime - currentPlaybackTime;
                        console.log(`▶ 음악 재생 (이전 위치: ${currentPlaybackTime.toFixed(2)}초)`);
                        isPlaying = true;
                        animate(); 

                        playPauseButton.textContent = "Stop";
                        playPauseButton.style.backgroundColor = "#dc3545"; 
                    });
            } else {
                    sound.offset = currentPlaybackTime;
                    sound.play();
                    audioContextStartTime = sound.context.currentTime - currentPlaybackTime;
                    console.log(`▶ 음악 재생 (이전 위치: ${currentPlaybackTime.toFixed(2)}초)`);
                    isPlaying = true;
                    animate(); 

                    playPauseButton.textContent = "Stop";
                    playPauseButton.style.backgroundColor = "#dc3545"; 
                }
            } else {
                // ■ 정지 모드
                currentPlaybackTime = sound.context.currentTime - audioContextStartTime;
                sound.stop();
                console.log(`🛑 음악 정지 (저장된 위치: ${currentPlaybackTime.toFixed(2)}초)`);
                isPlaying = false;

                if (animateFrameId) {
                    cancelAnimationFrame(animateFrameId);
                    console.log("🎥 애니메이션 루프 종료!");
                }

                bloomComposer.render(); // 정지 후 마지막 프레임 유지
                playPauseButton.textContent = "Play";
                playPauseButton.style.backgroundColor = "#28a745"; 
            }
        });
    });
};

// 음악 종료 시 Replay 버튼으로 변경
sound.onEnded = function () {
    console.log("🎵 음악이 끝났습니다. Replay 버튼으로 변경");

    playPauseButton.textContent = "Replay";
    playPauseButton.style.backgroundColor = "#60A5FA"; 
    playPauseButton.style.color = "white";
    playPauseButton.style.cursor = "pointer";

    isPlaying = false;
    currentPlaybackTime = 0; // 재생 위치 초기화
};

// 초기 장면을 렌더링 (흰 화면 방지)
function initialRender() {
    bloomComposer.render();
}
initialRender();

// 애니메이션 루프 (재생 중일 때만 실행)
const clock = new THREE.Clock();
let animateFrameId;

function animate() {
    if (!isPlaying) return;
    animateFrameId = requestAnimationFrame(animate);

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.5;
    camera.lookAt(scene.position);

    uniforms.u_time.value = clock.getElapsedTime();

    if (analyser && sound.isPlaying) {
        const frequencyValue = analyser.getAverageFrequency();
        if (frequencyValue > 0) {
            uniforms.u_frequency.value = frequencyValue;
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

// ✅ React에서 블루투스 상태를 받을 수 있도록 설정
window.addEventListener("message", (event) => {
    if (event.data.type === "bluetoothStatus") {
        console.log(`💡 Bluetooth Status: ${event.data.status}`);
    }
});
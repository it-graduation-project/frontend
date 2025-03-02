console.log("✅ scripts.js 실행됨!");
console.log("✅ import.meta.url:", import.meta.url);

import * as THREE from "three";
import { GUI } from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const params = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    threshold: 0.5,
    strength: 0.5,
    radius: 0.8
};

renderer.outputColorSpace = THREE.SRGBColorSpace;

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

camera.position.set(0, -2, 14);
camera.lookAt(0, 0, 0);

const uniforms = {
    u_time: { type: 'f', value: 0.0 },
    u_frequency: { type: 'f', value: 0.0 },
    u_red: { type: 'f', value: 1.0 },
    u_green: { type: 'f', value: 1.0 },
    u_blue: { type: 'f', value: 1.0 }
};

const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
});

const geo = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
mesh.material.wireframe = true;

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
let analyser = null; 
let currentPlaybackTime = 0;
let isPlaying = false;

// 버튼 하나로 모든 상태 처리 (로딩 중, 재생, 정지)
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

// JWT 포함해서 fetch 요청
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

        playPauseButton.addEventListener("click", () => {
            if (!isPlaying) {
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

// 🎨 Colors Folder (색상 조절)
const colorsFolder = gui.addFolder('Colors');
colorsFolder.add(params, 'red', 0, 1).onChange(value => uniforms.u_red.value = Number(value));
colorsFolder.add(params, 'green', 0, 1).onChange(value => uniforms.u_green.value = Number(value));
colorsFolder.add(params, 'blue', 0, 1).onChange(value => uniforms.u_blue.value = Number(value));

// ✨ Bloom Folder (블룸 효과 조절)
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

// 창 크기 변경 디버깅
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
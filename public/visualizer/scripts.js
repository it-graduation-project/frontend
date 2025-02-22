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
let analyser = null; // FFT 분석기 전역 변수

// ✅ JWT 포함해서 fetch 요청
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

// ✅ 오디오 로드 및 자동 재생
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

        // ✅ 사용자 클릭이 필요할 경우 처리
        if (sound.context.state === "suspended") {
            console.warn("⚠️ AudioContext가 차단됨. 사용자 입력 필요!");
            document.body.addEventListener("click", () => {
                sound.context.resume().then(() => {
                    sound.play();
                    console.log("✅ 사용자가 클릭하여 재생 시작됨!");
                });
            }, { once: true });
        } else {
            sound.play();
        }

        animate(); // ✅ 음악 재생 후 애니메이션 실행
    });
};

// ✅ 시각화 설정 유지
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

// ✅ 마우스 이벤트 디버깅
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

// ✅ 애니메이션 루프
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.5;
    camera.lookAt(scene.position);

    uniforms.u_time.value = clock.getElapsedTime();

    if (analyser && sound.isPlaying) {
        const frequencyValue = analyser.getAverageFrequency();
        if (frequencyValue === 0) {
            console.warn("⚠️ FFT 값이 0입니다. 무음일 수 있습니다.");
        } else {
            uniforms.u_frequency.value = frequencyValue;
            // console.log(`🎵 FFT 주파수 값: ${frequencyValue}`);
        }
    }

    bloomComposer.render();
}
animate();

// ✅ 창 크기 변경 디버깅
window.addEventListener('resize', function() {
    console.log("📏 창 크기 변경 감지됨!");

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);

    console.log(`📐 새로운 화면 크기 - 너비: ${window.innerWidth}, 높이: ${window.innerHeight}`);
});

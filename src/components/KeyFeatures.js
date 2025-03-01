/*
  KeyFeatures.js - 주요 기능 섹션 컴포넌트
  -------------------------------------------------
  - 음악 촉각화, 시각화, 제스처 컨트롤 기능을 소개하는 섹션
  - 각 기능을 카드 형태로 표시하며, 선택 시 상세 정보 제공
  - 사용자가 특정 기능을 클릭하면 해당 기능의 세부 설명을 동적으로 표시

  [ features 배열 구조 ]
  - id: 기능의 고유 식별자 (예: "tactilization", "visualization", "gesture")
  - title: 기능 제목 (예: "Music Tactilization")
  - shortDescription: 기능 요약 설명
  - detailsDescription: 기능의 상세 설명
  - details: 해당 기능의 주요 특징을 리스트로 제공 
  - icon: 해당 기능을 나타내는 이미지 경로
*/

import React, { useState } from "react";
import "../styles/KeyFeatures.css";
import vibrateIconImage from "../images/vibrate-icon.png";
import visualizeIconImage from "../images/visualize-icon.png";
import gestureIconImage from "../images/gesture-icon.png";

const features = [
  {
    id: "tactilization",
    title: "Music Tactilization",
    shortDescription: "Feel music through haptic vibrations and tactile feedback",
    detailsDescription: "Experience music in a completely new way through advanced haptic feedback technology. Our device translates different musical elements into distinct tactile sensations:",
    details: [
      { icon: "🎛️", text: "Bass frequencies as deep vibrations" },
      { icon: "🎵", text: "Melody as rhythmic patterns" },
      { icon: "🌊", text: "Dynamic range as intensity variation" },
    ],
    icon: vibrateIconImage,
  },
  {
    id: "visualization",
    title: "Music Visualization",
    shortDescription: "See music through dynamic real-time visual effects",
    detailsDescription: "See music through dynamic real-time visual effects that respond to different frequencies and beats, creating an immersive audiovisual experience.",
    details: [
      { icon: "🌊", text: "Waveform animations" },
      { icon: "💡", text: "Color shifts based on tone" },
      { icon: "⚡", text: "Beat-synchronized effects" },
    ],
    icon: visualizeIconImage, 
  },
  {
    id: "gesture",
    title: "Gesture Control",
    shortDescription: "Control and interact with music using intuitive hand gestures",
    detailsDescription: "Control and interact with music using intuitive hand gestures. Adjust playback, volume, and effects simply by moving your hands.",
    details: [
      { icon: "✋", text: "Pause & Play with hand motion" },
      { icon: "🔊", text: "Volume control with swipe" },
      { icon: "🎛️", text: "Effect modulation via gestures" },
    ],
    icon: gestureIconImage, 
  },
];

const KeyFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <section className="key-features">
      <h2>Key Features</h2>
      <div className="feature-buttons">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`feature-card ${
              selectedFeature.id === feature.id ? "active" : ""
            }`}
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="feature-icon">
              <img src={feature.icon} alt={`${feature.title} Icon`} />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.shortDescription}</p>
          </div>
        ))}
      </div>
      <div className="feature-details">
        <h3>{selectedFeature.title}</h3>
        <p>{selectedFeature.detailsDescription}</p>
        <ul>
          {selectedFeature.details.map((detail, index) => (
            <li key={index}>
              <span>{detail.icon}</span> {detail.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default KeyFeatures;

import React, { useState } from "react";
import "../styles/KeyFeatures.css";
import frequencyIconImage from "../images/music-icon.png";

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
    icon: frequencyIconImage,
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
    icon: frequencyIconImage, 
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
    icon: frequencyIconImage, 
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
              <img src={frequencyIconImage} alt="Frequency Icon" />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.shortDescription}</p>
            <span className="learn-more">Click to learn more</span>
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

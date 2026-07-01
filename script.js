// ========================================
//  🎹 PIANO CORD DROP + AUTO PLAY + REVEAL
// ========================================

const pianoScene = document.getElementById("pianoScene");
const nameReveal = document.getElementById("nameReveal");
const sparksContainer = document.getElementById("sparks");
const ripplesContainer = document.getElementById("ripples");
const pianoGlow = document.querySelector(".piano-glow");
const whiteKeys = document.querySelectorAll(".key.white");
const blackKeys = document.querySelectorAll(".key.black");
const enterBtn = document.getElementById("enterBtn");

// ---- Audio Context for piano sounds ----
let audioCtx = null;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playNote(frequency, duration = 0.6) {
  if (!audioCtx) initAudio();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  // Piano-like tone
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Slight detune for richness
  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(frequency * 2, audioCtx.currentTime);
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);

  // Filter
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2500, audioCtx.currentTime);

  // Envelope
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  gain2.gain.setValueAtTime(0, audioCtx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration * 0.7);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);

  osc.start();
  osc2.start();
  osc.stop(audioCtx.currentTime + duration);
  osc2.stop(audioCtx.currentTime + duration);
}

// ---- Note frequencies (C4 to B5 range) ----
const noteFreqs = [
  261.63, 293.66, 329.63, 349.23, 392.00,
  440.00, 493.88, 523.25, 587.33, 659.25,
  698.46, 783.99, 880.00, 987.77
];

// ---- Create sparks ----
function createSparks(x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.classList.add("spark");
    spark.style.left = x + "px";
    spark.style.top = y + "px";

    const angle = (Math.PI * 2 * i) / count;
    const distance = 40 + Math.random() * 80;
    spark.style.setProperty("--sx", Math.cos(angle) * distance + "px");
    spark.style.setProperty("--sy", Math.sin(angle) * distance + "px");
    spark.style.animationDuration = (0.5 + Math.random() * 0.5) + "s";

    sparksContainer.appendChild(spark);
    setTimeout(() => spark.remove(), 1200);
  }
}

// ---- Create ripple ----
function createRipple(x, y) {
  const ripple = document.createElement("div");
  ripple.classList.add("ripple");
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";
  ripplesContainer.appendChild(ripple);
  setTimeout(() => ripple.remove(), 2000);
}

// ---- Press a key ----
function pressKey(keyEl, noteIndex, delay) {
  setTimeout(() => {
    // Visual press
    keyEl.classList.add("pressed", "glow");

    // Sound
    if (noteIndex < noteFreqs.length) {
      playNote(noteFreqs[noteIndex], 0.8);
    }

    // Sparks at key position
    const rect = keyEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + 10;
    createSparks(cx, cy, 8);
    createRipple(cx, cy);

    // Piano glow
    pianoGlow.classList.add("active");

    // Release after a bit
    setTimeout(() => {
      keyEl.classList.remove("pressed");
      setTimeout(() => {
        keyEl.classList.remove("glow");
      }, 300);
    }, 200);
  }, delay);
}

// ---- Melody sequence ----
// A nice ascending + descending melody
const melody = [
  { key: 0, time: 0 },
  { key: 2, time: 250 },
  { key: 4, time: 500 },
  { key: 5, time: 700 },
  { key: 7, time: 950 },
  { key: 9, time: 1200 },
  { key: 11, time: 1450 },
  { key: 12, time: 1700 },
  // Descending
  { key: 11, time: 2100 },
  { key: 9, time: 2350 },
  { key: 7, time: 2600 },
  { key: 5, time: 2850 },
  // Final chord (multiple keys)
  { key: 0, time: 3200 },
  { key: 4, time: 3200 },
  { key: 7, time: 3200 },
  { key: 12, time: 3200 },
];

// ---- Impact effect when cord hits piano ----
function cordImpact() {
  // Big spark burst
  const pianoRect = document.querySelector(".piano-body").getBoundingClientRect();
  const cx = pianoRect.left + pianoRect.width / 2;
  const cy = pianoRect.top;

  createSparks(cx, cy, 25);
  createRipple(cx, cy);

  // Screen shake
  document.body.style.animation = "none";
  pianoScene.style.animation = "screenShake 0.4s ease";
  setTimeout(() => {
    pianoScene.style.animation = "none";
  }, 400);

  // Flash
  pianoGlow.classList.add("active");

  // Play impact chord
  playNote(130.81, 1.2); // C3
  playNote(164.81, 1.0); // E3
  playNote(196.00, 1.0); // G3
}

// ---- Start the show ----
function startAnimation() {
  initAudio();

  // Cord falls for 2s, then impact
  setTimeout(() => {
    cordImpact();
  }, 2000);

  // Auto-play melody starts after impact
  const melodyStart = 2800;
  melody.forEach((note) => {
    const keyEl = whiteKeys[note.key];
    if (keyEl) {
      pressKey(keyEl, note.key, melodyStart + note.time);
    }
  });

  // After melody ends, transition to name reveal
  const transitionTime = melodyStart + 4200;
  setTimeout(() => {
    // Fade out piano scene
    pianoScene.style.opacity = "0";

    setTimeout(() => {
      pianoScene.style.display = "none";
      nameReveal.classList.add("active");
    }, 1000);
  }, transitionTime);
}

// ---- Screen shake keyframe (inject dynamically) ----
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes screenShake {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-4px, 2px); }
    20% { transform: translate(4px, -2px); }
    30% { transform: translate(-3px, 3px); }
    40% { transform: translate(3px, -1px); }
    50% { transform: translate(-2px, 2px); }
    60% { transform: translate(2px, -2px); }
    70% { transform: translate(-1px, 1px); }
    80% { transform: translate(1px, -1px); }
    90% { transform: translate(-1px, 0px); }
  }
`;
document.head.appendChild(shakeStyle);

// ---- Enter button ----
enterBtn.addEventListener("click", () => {
  nameReveal.style.transition = "opacity 0.8s ease";
  nameReveal.style.opacity = "0";
  setTimeout(() => {
    window.location.href = "home.html";
  }, 800);
});

// ---- Auto-start on page load ----
// Need user interaction for audio on most browsers
// So we show a click-to-start overlay

const clickOverlay = document.createElement("div");
clickOverlay.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.6s ease;
`;
clickOverlay.innerHTML = `
  <div style="
    font-size: clamp(40px, 8vw, 70px);
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  ">🎹</div>
  <div style="
    color: rgba(255,255,255,0.85);
    font-size: clamp(16px, 3vw, 22px);
    letter-spacing: 3px;
    text-transform: uppercase;
  ">Click to Start</div>
  <div style="
    color: rgba(0,229,255,0.6);
    font-size: 14px;
    margin-top: 10px;
    letter-spacing: 1px;
  ">🔊 Turn on sound for best experience</div>
`;

// Add pulse animation for emoji
const pulseStyle = document.createElement("style");
pulseStyle.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
`;
document.head.appendChild(pulseStyle);

document.body.appendChild(clickOverlay);

clickOverlay.addEventListener("click", () => {
  clickOverlay.style.opacity = "0";
  setTimeout(() => {
    clickOverlay.remove();
    startAnimation();
  }, 600);
});

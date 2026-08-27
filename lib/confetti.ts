import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage celebration with confetti showers and colorful fireworks bursts!
 */
export function triggerCelebration() {
  // Stage 1: Central Pop
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF6B35', '#FFC857', '#FF4F6D', '#22C55E', '#3BA7FF', '#9333EA'],
  });

  // Stage 2: Left and Right Fireworks Cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF6B35', '#FFC857', '#FF4F6D', '#FFFFFF'],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#22C55E', '#3BA7FF', '#FFC857', '#FFFFFF'],
    });
  }, 250);

  // Stage 3: High Sky Fireworks Burst
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.4 },
      startVelocity: 45,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FFD700', '#FF4500', '#FF1493', '#00FF7F', '#00BFFF'],
    });
  }, 600);

  // Stage 4: Gentle Gold and Stars rain
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.1 },
      gravity: 0.6,
      colors: ['#FFD700', '#FFA500', '#FFFFFF'],
    });
  }, 1000);
}

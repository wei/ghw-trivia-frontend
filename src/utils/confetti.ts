import React, { useEffect } from 'react';

interface ConfettiConfig {
  particleCount?: number;
}

const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export const triggerConfetti = (config?: ConfettiConfig) => {
  const particleCount = config?.particleCount || 100;
  
  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    confetti.style.borderRadius = '50%';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    
    const duration = Math.random() * 2 + 2; // 2-4 seconds
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const velocity = Math.random() * 8 + 4; // 4-12 px/ms
    
    let x = parseFloat(confetti.style.left);
    let y = 0;
    let vx = Math.cos(angle) * velocity;
    let vy = Math.sin(angle) * velocity - 5; // Initial upward velocity
    let gravity = 0.1;
    let alpha = 1;
    
    document.body.appendChild(confetti);
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / (duration * 1000);
      
      if (progress > 1) {
        confetti.remove();
        return;
      }
      
      vy += gravity;
      x += vx;
      y += vy;
      alpha = 1 - progress;
      
      confetti.style.left = x + 'px';
      confetti.style.top = y + 'px';
      confetti.style.opacity = alpha.toString();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
};

interface ConfettiAnimationProps {
  trigger: boolean;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ trigger }) => {
  useEffect(() => {
    if (trigger) {
      triggerConfetti();
      
      // Multiple bursts for better effect
      setTimeout(() => {
        triggerConfetti({ particleCount: 50 });
      }, 100);

      setTimeout(() => {
        triggerConfetti({ particleCount: 50 });
      }, 200);
    }
  }, [trigger]);

  return null;
};

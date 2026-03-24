/**
 * Confetti Celebration Component
 * Used for level-ups and achievement unlocks
 */

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  generateParticles,
  getParticleStyles,
  shouldShowCelebration,
  getContainerClasses,
  getBackgroundGlowClasses,
  getMessageContainerClasses,
  getSparklesClasses,
  getMessageClasses,
  getSubtitleClasses,
  getParticleClasses,
  getFallAnimationKeyframes
} from './ConfettiCelebrationBehaviour';

interface ConfettiCelebrationProps {
  show: boolean;
  message: string;
  onComplete: () => void;
  duration?: number;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  show,
  message,
  onComplete,
  duration = 3000
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    if (!show) return;

    // Create particles using behaviour function
    const newParticles = generateParticles();
    setParticles(newParticles);

    // Auto-hide after duration
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onComplete]);

  if (!shouldShowCelebration(show)) return null;

  return (
    <div className={getContainerClasses()}>
      {/* Background glow */}
      <div className={getBackgroundGlowClasses()} />

      {/* Center message */}
      <div className={getMessageContainerClasses()}>
        <div className="animate-bounce">
          <Sparkles className={getSparklesClasses()} size={64} />
        </div>
        <h2 className={getMessageClasses()}>
          🎉 {message} 🎉
        </h2>
        <p className={getSubtitleClasses()}>Amazing work!</p>
      </div>

      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={getParticleClasses()}
          style={getParticleStyles(particle)}
        />
      ))}

      <style>{getFallAnimationKeyframes()}</style>
    </div>
  );
};

export default ConfettiCelebration;

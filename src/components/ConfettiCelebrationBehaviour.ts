/**
 * Confetti Celebration Behaviour Module
 * Extracted from ConfettiCelebration component
 * Handles particle generation and animation logic
 */

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

/**
 * Generate confetti particles for celebration effect
 * @param count - Number of particles to generate
 * @returns Array of particle objects
 */
export const generateParticles = (count: number = 50) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100 - 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 10 + 5,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1 + 1.5,
  }));
};

/**
 * Calculate animation styles for a confetti particle
 * @param particle - Particle object
 * @returns CSS style object
 */
export const getParticleStyles = (particle: {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}) => {
  return {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: particle.size,
    height: particle.size,
    backgroundColor: particle.color,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.duration}s`,
  };
};

/**
 * Determine if celebration should be visible
 * @param show - Show prop from component
 * @returns Whether to render the celebration
 */
export const shouldShowCelebration = (show: boolean) => {
  return show;
};

/**
 * Get CSS classes for the celebration container
 * @returns Container CSS classes
 */
export const getContainerClasses = () => {
  return 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
};

/**
 * Get CSS classes for the background glow
 * @returns Background glow CSS classes
 */
export const getBackgroundGlowClasses = () => {
  return 'absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse';
};

/**
 * Get CSS classes for the center message container
 * @returns Message container CSS classes
 */
export const getMessageContainerClasses = () => {
  return 'relative z-10 text-center';
};

/**
 * Get CSS classes for the sparkles icon
 * @returns Sparkles CSS classes
 */
export const getSparklesClasses = () => {
  return 'mx-auto text-amber-500';
};

/**
 * Get CSS classes for the celebration message
 * @returns Message CSS classes
 */
export const getMessageClasses = () => {
  return 'text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mt-4 animate-pulse';
};

/**
 * Get CSS classes for the subtitle
 * @returns Subtitle CSS classes
 */
export const getSubtitleClasses = () => {
  return 'text-gray-600 mt-2';
};

/**
 * Get CSS classes for confetti particles
 * @returns Particle CSS classes
 */
export const getParticleClasses = () => {
  return 'absolute rounded-full animate-fall';
};

/**
 * Get the CSS keyframes for falling animation
 * @returns CSS keyframes string
 */
export const getFallAnimationKeyframes = () => {
  return `
    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
};
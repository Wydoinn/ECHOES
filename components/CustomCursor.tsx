import * as React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const TRAIL_LENGTH = 7;

const CustomCursor: React.FC = () => {
  const mouse = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Main cursor position (smooth spring)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 20, stiffness: 450, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Trail Motion Values - declare hooks at top level
  const trail0X = useMotionValue(-100);
  const trail0Y = useMotionValue(-100);
  const trail1X = useMotionValue(-100);
  const trail1Y = useMotionValue(-100);
  const trail2X = useMotionValue(-100);
  const trail2Y = useMotionValue(-100);
  const trail3X = useMotionValue(-100);
  const trail3Y = useMotionValue(-100);
  const trail4X = useMotionValue(-100);
  const trail4Y = useMotionValue(-100);
  const trail5X = useMotionValue(-100);
  const trail5Y = useMotionValue(-100);
  const trail6X = useMotionValue(-100);
  const trail6Y = useMotionValue(-100);

  const trail = useMemo(() => [
    { x: trail0X, y: trail0Y },
    { x: trail1X, y: trail1Y },
    { x: trail2X, y: trail2Y },
    { x: trail3X, y: trail3Y },
    { x: trail4X, y: trail4Y },
    { x: trail5X, y: trail5Y },
    { x: trail6X, y: trail6Y },
  ], [trail0X, trail0Y, trail1X, trail1Y, trail2X, trail2Y, trail3X, trail3Y, trail4X, trail4Y, trail5X, trail5Y, trail6X, trail6Y]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detect interactive elements
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('[data-hoverable="true"]') ||
        target.closest('button') ||
        target.closest('a') ||
        getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isInteractive);
    };

    // Use requestAnimationFrame for smooth trail physics
    let animationFrameId: number;

    const animateTrail = () => {
      let leadX = smoothX.get();
      let leadY = smoothY.get();

      trail.forEach((point, index) => {
        const prevX = point.x.get();
        const prevY = point.y.get();

        // Lerp for organic follow delay
        // First dots follow faster, tail follows slower
        const moveFactor = 0.4 - (index * 0.04);

        const nextX = prevX + (leadX - prevX) * moveFactor;
        const nextY = prevY + (leadY - prevY) * moveFactor;

        point.x.set(nextX);
        point.y.set(nextY);

        // Current point becomes the leader for the next point in the chain
        leadX = nextX;
        leadY = nextY;
      });

      animationFrameId = requestAnimationFrame(animateTrail);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    animationFrameId = requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorX, cursorY, smoothX, smoothY, trail]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Trail Elements */}
      {trail.map((point, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-exclusion"
          style={{
            x: point.x,
            y: point.y,
            left: -6,
            top: -6,
            width: 12,
            height: 12,
            // Premium gold gradient on hover, purple/gold on idle
            backgroundColor: isHovering
               ? `hsl(${45 + i * 5}, 80%, ${60 - i * 3}%)` // Gold tones
               : `hsl(${280 + i * 8}, 70%, ${65 - i * 4}%)`, // Purple to gold
            opacity: 0.6 - (i / TRAIL_LENGTH) * 0.5,
            scale: 1 - (i / TRAIL_LENGTH) * 0.7,
          }}
        />
      ))}

      {/* Hover Ripple (Premium Gold Pulse) */}
      <AnimatePresence>
        {isHovering && (
          <>
            {/* Outer large ripple - gold */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: [0, 0.4, 0],
                    scale: [1, 2.5, 3],
                    borderColor: ['rgba(212, 175, 55, 0.7)', 'rgba(212, 175, 55, 0)']
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                }}
                className="absolute top-0 left-0 rounded-full border-2 border-[#d4af37]/50"
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 40,
                    height: 40,
                }}
            />
            {/* Inner faster ripple - purple accent */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.8, 2],
                    borderColor: ['rgba(147, 51, 234, 0.6)', 'rgba(147, 51, 234, 0)']
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.2
                }}
                className="absolute top-0 left-0 rounded-full border border-purple-500/50"
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 40,
                    height: 40,
                }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Cursor Orb */}
      <motion.div
        className="absolute top-0 left-0 rounded-full border-2 backdrop-blur-[1px] mix-blend-exclusion"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 56 : 26,
          height: isHovering ? 56 : 26,
          borderColor: isHovering ? 'rgba(212, 175, 55, 0.9)' : 'rgba(255, 255, 255, 0.8)',
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0)',
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
         {/* Center Dot */}
         <motion.div
           className="absolute top-1/2 left-1/2 rounded-full bg-white"
           animate={{
             width: isHovering ? 8 : 5,
             height: isHovering ? 8 : 5,
             x: '-50%',
             y: '-50%',
             backgroundColor: isHovering ? '#d4af37' : '#ffffff' // Gold on hover
           }}
         />
      </motion.div>
    </div>
  );
};

export default CustomCursor;


import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

const Icons = {
  Undo: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  Redo: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7"/></svg>
};

const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff6b9d'); // Default accent pink
  const [brushSize, setBrushSize] = useState(6);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  // Track DPR for consistent scaling
  const dprRef = useRef(1);

  // History State
  const [historyStep, setHistoryStep] = useState(0);
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle High DPI displays
        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;

        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);

        // Initial Background fill (purple theme - semi-transparent look)
        ctx.fillStyle = '#0d0617';
        ctx.fillRect(0, 0, rect.width, rect.height);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Initialize History
        const initialData = canvas.toDataURL();
        historyRef.current = [initialData];
        setHistoryStep(0);
      }
    }
  }, [isOpen]);

  // Fading Loop - DISABLED to preserve stroke colors
  // useEffect(() => {
  //   if (!isOpen) return;

  //   let animationId: number;
  //   const canvas = canvasRef.current;
  //   const ctx = canvas?.getContext('2d');

  //   const animate = () => {
  //       if (ctx && canvas && !isDrawing) {
  //           ctx.shadowBlur = 0;
  //           ctx.shadowColor = 'transparent';
  //           ctx.globalCompositeOperation = 'source-over';
  //           ctx.fillStyle = 'rgba(28, 28, 28, 0.015)';
  //           const width = canvas.width / dprRef.current;
  //           const height = canvas.height / dprRef.current;
  //           ctx.fillRect(0, 0, width, height);
  //       }
  //       animationId = requestAnimationFrame(animate);
  //   };

  //   animationId = requestAnimationFrame(animate);

  //   return () => cancelAnimationFrame(animationId);
  // }, [isOpen, isDrawing]);

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    const newHistory = historyRef.current.slice(0, historyStep + 1);
    newHistory.push(data);
    historyRef.current = newHistory;
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
        const newStep = historyStep - 1;
        setHistoryStep(newStep);
        const historyItem = historyRef.current[newStep];
        if (historyItem) restoreCanvas(historyItem);
    }
  };

  const redo = () => {
    if (historyStep < historyRef.current.length - 1) {
        const newStep = historyStep + 1;
        setHistoryStep(newStep);
        const historyItem = historyRef.current[newStep];
        if (historyItem) restoreCanvas(historyItem);
    }
  };

  const restoreCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
        ctx.save();
        // Reset transform to draw 1:1 with backing store
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    };
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Calculate scaling factors between displayed size and backing store
      // Account for DPR scaling applied to context
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
          x: (x * scaleX) / dprRef.current,
          y: (y * scaleY) / dprRef.current
      };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        lastPos.current = null;
        saveHistory();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    // Neon Brush Style
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    ctx.beginPath();
    if (lastPos.current) {
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
    } else {
        ctx.moveTo(currentPos.x, currentPos.y);
    }
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
      onClose();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            onClose();
        }
        const isCmd = e.metaKey || e.ctrlKey;

        // Cmd+Enter: Save
        if (isCmd && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
        // Cmd+Z: Undo / Redo
        if (isCmd && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, historyStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0617]/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-[#0d0617]/90 border border-purple-500/20 rounded-2xl p-6 shadow-[0_20px_60px_rgba(139,92,246,0.15)] max-w-5xl w-full flex flex-col items-center max-h-[90vh]"
          >
            <h3 className="text-2xl font-serif-display text-white/90 mb-2">Draw Your Feeling</h3>
            <p className="text-white/40 text-sm mb-4">The strokes fade, like passing thoughts.</p>

            <div className="relative rounded-lg overflow-hidden border border-purple-500/20 shadow-inner cursor-crosshair w-full h-full flex-1 min-h-[300px]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="touch-none w-full h-full"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 w-full px-2">

              {/* Undo / Redo */}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <button
                    onClick={undo}
                    disabled={historyStep <= 0}
                    className={`p-1.5 rounded-full transition-colors ${historyStep <= 0 ? 'text-white/20' : 'text-white/70 hover:bg-white/10'}`}
                    title="Undo (Cmd+Z)"
                  >
                    <Icons.Undo />
                  </button>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <button
                    onClick={redo}
                    disabled={historyStep >= historyRef.current.length - 1}
                    className={`p-1.5 rounded-full transition-colors ${historyStep >= historyRef.current.length - 1 ? 'text-white/20' : 'text-white/70 hover:bg-white/10'}`}
                    title="Redo (Cmd+Shift+Z)"
                  >
                    <Icons.Redo />
                  </button>
              </div>

              <div className="w-[1px] h-8 bg-white/20 hidden sm:block" />

              {/* Colors */}
              <div className="flex space-x-2">
                {['#ff6b9d', '#8b5cf6', '#ffffff', '#3b82f6', '#ef4444'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                  />
                ))}
              </div>

              <div className="w-[1px] h-8 bg-white/20 hidden sm:block" />

              {/* Size Slider */}
               <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 md:w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/80 focus:outline-none"
                    aria-label="Brush Size"
                  />
                  <div className="w-3.5 h-3.5 rounded-full bg-white/40" />
              </div>

              <div className="w-[1px] h-8 bg-white/20 hidden sm:block" />

              {/* Actions */}
              <div className="flex items-center gap-3">
                  <button onClick={onClose} className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white/60 transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-5 py-2 rounded-full bg-white/90 text-black hover:bg-white shadow-lg shadow-black/20 transition-opacity text-sm whitespace-nowrap font-medium">
                    Capture Moment
                  </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrawingModal;

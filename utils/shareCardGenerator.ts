
import { TransformationResult } from '../types';

export const generateShareCard = async (result: TransformationResult) => {
  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background (Dark Gradient)
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#05020a'); // Deepest dark
  gradient.addColorStop(0.4, '#1a0b2e'); // Purple tint
  gradient.addColorStop(1, '#05020a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 2. Stars (Background Texture)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 3. Draw ECHOES branding (Top Center)
  ctx.font = '200 28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('E C H O E S', size / 2, 60);

  // 4. Visual Metaphor (SVG Path)
  // Scale path (0-100) to fit nicely in the center-top
  const pathScale = 5; // 500px approx
  const offsetX = (size - (100 * pathScale)) / 2;
  const offsetY = (size - (100 * pathScale)) / 2 - 80; 

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(pathScale, pathScale);

  // Glow
  ctx.shadowColor = '#e879f9';
  ctx.shadowBlur = 20;
  
  const pathString = result.visualMetaphorPath || "M 30 50 C 30 20 70 20 70 50 C 70 80 30 80 30 50 Z";
  const path = new Path2D(pathString);
  
  // Outer Stroke (Purple/Pink Gradient simulation via strokeStyle)
  // Canvas strokeStyle gradient is relative to canvas, not path, so we use a color close to the middle of the gradient
  ctx.strokeStyle = '#d8b4fe'; // Light purple
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  
  // Inner Stroke (White hot)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.4;
  ctx.shadowBlur = 0;
  ctx.stroke(path);

  ctx.restore();

  // 5. Text (Quote)
  ctx.font = 'italic 400 42px Cinzel, serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const text = `"${result.visualMetaphor}"`;
  const maxWidth = size * 0.75;
  const lineHeight = 65;
  const centerX = size / 2;
  const startY = size * 0.65; 

  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((l, i) => {
      ctx.fillText(l.trim(), centerX, startY + (i * lineHeight));
  });

  // 6. Date Stamp (Bottom)
  ctx.font = '300 20px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillText(dateStr, size / 2, size - 80);

  // 7. Export & Download
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `echoes-insight-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to generate card", err);
  }
};

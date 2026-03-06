
import { TransformationResult } from '../types';

const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.save();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

const drawGoldLine = (ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) => {
  const grad = ctx.createLinearGradient(x1, y, x2, y);
  grad.addColorStop(0, 'rgba(212,175,55,0)');
  grad.addColorStop(0.2, 'rgba(212,175,55,0.6)');
  grad.addColorStop(0.5, 'rgba(244,229,178,0.9)');
  grad.addColorStop(0.8, 'rgba(212,175,55,0.6)');
  grad.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
};

export const generateShareCard = async (result: TransformationResult) => {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cx = W / 2;

  // ───────────────────────────────────────────
  // 1. PREMIUM BACKGROUND
  // ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#05020a');
  bg.addColorStop(0.15, '#0d0617');
  bg.addColorStop(0.45, '#1a0b2e');
  bg.addColorStop(0.75, '#0d0617');
  bg.addColorStop(1, '#05020a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Vignette overlay
  const vig = ctx.createRadialGradient(cx, H / 2, W * 0.25, cx, H / 2, W * 0.85);
  vig.addColorStop(0, 'rgba(26,11,46,0.0)');
  vig.addColorStop(1, 'rgba(5,2,10,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // 2. Star field
  for (let i = 0; i < 120; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    const sr = Math.random() * 1.2 + 0.2;
    const sa = Math.random() * 0.25 + 0.05;
    ctx.fillStyle = `rgba(244,229,178,${sa})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // ───────────────────────────────────────────
  // 3. TOP BORDER — gold line
  // ───────────────────────────────────────────
  drawGoldLine(ctx, 100, 70, W - 100);

  // ───────────────────────────────────────────
  // 4. ECHOES BRANDING
  // ───────────────────────────────────────────
  ctx.font = '300 36px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#f4e5b2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E C H O E S', cx, 120);

  // Subtitle
  ctx.font = '300 14px "Times New Roman", Georgia, serif';
  ctx.fillStyle = 'rgba(212,175,55,0.6)';
  ctx.fillText('E M O T I O N A L   I N S I G H T', cx, 150);

  // Diamond ornament
  drawDiamond(ctx, cx, 185, 8);

  // ───────────────────────────────────────────
  // 5. VISUAL METAPHOR
  // ───────────────────────────────────────────
  const pathString = result.visualMetaphorPath || 'M 30 50 C 30 20 70 20 70 50 C 70 80 30 80 30 50 Z';
  const path = new Path2D(pathString);
  const pathScale = 4.5;
  const pathAreaSize = 100 * pathScale;
  const offsetX = (W - pathAreaSize) / 2;
  const offsetY = 220;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(pathScale, pathScale);

  // Multi-layer gold glow
  ctx.shadowColor = '#d4af37';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);

  // Inner bright gold pass
  ctx.shadowColor = '#f4e5b2';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#f4e5b2';
  ctx.lineWidth = 0.8;
  ctx.stroke(path);

  // White-hot core
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 0.3;
  ctx.stroke(path);

  ctx.restore();

  // ───────────────────────────────────────────
  // 6. DIVIDER — gold line below illustration
  // ───────────────────────────────────────────
  const dividerY = offsetY + pathAreaSize + 30;
  drawGoldLine(ctx, 200, dividerY, W - 200);

  // ───────────────────────────────────────────
  // 7. QUOTE
  // ───────────────────────────────────────────
  const quoteText = `\u201C${result.visualMetaphor}\u201D`;
  ctx.font = 'italic 38px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#e8e4de';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = W * 0.72;
  const lineHeight = 58;
  const lines = wrapText(ctx, quoteText, maxTextWidth);
  const totalTextHeight = lines.length * lineHeight;
  const quoteStartY = dividerY + 50 + ((H - dividerY - 50 - 180) / 2) - (totalTextHeight / 2);

  lines.forEach((l, i) => {
    ctx.fillText(l, cx, quoteStartY + i * lineHeight);
  });

  // ───────────────────────────────────────────
  // 8. LABEL — "Your Emotional Signature"
  // ───────────────────────────────────────────
  const labelY = quoteStartY + totalTextHeight + 40;
  ctx.font = '300 13px "Times New Roman", Georgia, serif';
  ctx.fillStyle = 'rgba(212,175,55,0.55)';
  ctx.fillText('Y O U R   E M O T I O N A L   S I G N A T U R E', cx, labelY);

  // ───────────────────────────────────────────
  // 9. BOTTOM SECTION — date & gold line
  // ───────────────────────────────────────────
  drawGoldLine(ctx, 100, H - 110, W - 100);

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  ctx.font = '300 16px "Times New Roman", Georgia, serif';
  ctx.fillStyle = 'rgba(200,200,210,0.5)';
  ctx.fillText(dateStr, cx, H - 75);

  // Tiny branding
  ctx.font = '300 11px "Times New Roman", Georgia, serif';
  ctx.fillStyle = 'rgba(212,175,55,0.4)';
  ctx.fillText('E C H O E S', cx, H - 45);

  // ───────────────────────────────────────────
  // 10. EXPORT & DOWNLOAD
  // ───────────────────────────────────────────
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `echoes-insight-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    throw new Error('Failed to generate share card. Please try again.');
  }
};

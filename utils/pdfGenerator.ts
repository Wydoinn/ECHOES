
import { jsPDF } from "jspdf";
import { TransformationResult, EmotionalData } from '../types';

// Generate a premium gold-glow image from the SVG metaphor path
const generateMetaphorImage = async (pathData: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const size = 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, size, size);

  const scale = 4;
  ctx.translate(size / 2 - (50 * scale), size / 2 - (50 * scale));
  ctx.scale(scale, scale);

  const p = new Path2D(pathData);

  // Multi-layer gold glow
  ctx.shadowColor = '#d4af37';
  ctx.shadowBlur = 25;
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(p);

  ctx.shadowColor = '#f4e5b2';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#f4e5b2';
  ctx.lineWidth = 1;
  ctx.stroke(p);

  return canvas.toDataURL('image/png');
};

// Decorative gradient gold line with fade-in/out
const drawGoldLine = (doc: jsPDF, x1: number, y: number, x2: number) => {
  const steps = 20;
  const segWidth = (x2 - x1) / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const alpha = Math.sin(t * Math.PI);
    const r = Math.round(212 * alpha + 50 * (1 - alpha));
    const g = Math.round(175 * alpha + 50 * (1 - alpha));
    const b = Math.round(55 * alpha + 50 * (1 - alpha));
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(x1 + i * segWidth, y, x1 + (i + 1) * segWidth, y);
  }
};

// Decorative diamond ornament
const drawDiamond = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.line(x, y - size, x + size, y);
  doc.line(x + size, y, x, y + size);
  doc.line(x, y + size, x - size, y);
  doc.line(x - size, y, x, y - size);
};

export const generateRelicPDF = async (result: TransformationResult, data: EmotionalData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  // --- PREMIUM COLOR PALETTE ---
  const C = {
    bg:        [13, 6, 23]       as [number, number, number],
    bgLight:   [26, 11, 46]      as [number, number, number],
    gold:      [212, 175, 55]    as [number, number, number],
    goldLight: [244, 229, 178]   as [number, number, number],
    textMain:  [255, 255, 255]   as [number, number, number],
    textSoft:  [200, 200, 210]   as [number, number, number],
    textMuted: [140, 130, 160]   as [number, number, number],
    purple:    [167, 139, 250]   as [number, number, number],
    cream:     [248, 246, 242]   as [number, number, number],
    ink:       [44, 24, 16]      as [number, number, number],
  };

  const setDarkBackground = () => {
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    // Subtle gradient header band
    doc.setFillColor(...C.bgLight);
    doc.rect(0, 0, pageWidth, 40, "F");
    for (let i = 0; i < 20; i++) {
      const alpha = 1 - (i / 20);
      const r = Math.round(26 * alpha + 13 * (1 - alpha));
      const g = Math.round(11 * alpha + 6 * (1 - alpha));
      const b = Math.round(46 * alpha + 23 * (1 - alpha));
      doc.setFillColor(r, g, b);
      doc.rect(0, 40 + i, pageWidth, 1, "F");
    }
  };

  // Page count for footer
  let totalPages = 5;
  if (result.audioInsight || data.drawing || result.emotionalArc) totalPages++;
  totalPages++; // closing page

  const addLuxuryFooter = (pageNum: number) => {
    drawGoldLine(doc, margin + 30, pageHeight - 18, pageWidth - margin - 30);
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.text(`${pageNum}  /  ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: "center" });
    doc.setFontSize(6);
    doc.setTextColor(...C.gold);
    doc.text("ECHOES", pageWidth / 2, pageHeight - 8, { align: "center" });
  };

  const addSectionHeader = (title: string, subtitle: string, y: number): number => {
    drawDiamond(doc, pageWidth / 2, y, 3);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.gold);
    doc.text(title.toUpperCase(), pageWidth / 2, y + 12, { align: "center" });
    if (subtitle) {
      doc.setFont("times", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.text(subtitle, pageWidth / 2, y + 18, { align: "center" });
    }
    drawGoldLine(doc, margin + 50, y + 22, pageWidth - margin - 50);
    return y + 30;
  };

  let currentPage = 1;

  // ========================================================
  //  PAGE 1 — ELEGANT COVER
  // ========================================================
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  drawGoldLine(doc, margin, 30, pageWidth - margin);

  // Grand Title
  doc.setFont("times", "normal");
  doc.setFontSize(48);
  doc.setTextColor(...C.goldLight);
  doc.text("ECHOES", pageWidth / 2, 65, { align: "center" });

  // Spaced subtitle
  doc.setFontSize(10);
  doc.setTextColor(...C.gold);
  doc.text("E M O T I O N A L   R E L I C", pageWidth / 2, 78, { align: "center" });

  drawDiamond(doc, pageWidth / 2, 90, 3);

  // Metaphor image
  if (result.visualMetaphorPath) {
    try {
      const metaphorImg = await generateMetaphorImage(result.visualMetaphorPath);
      if (metaphorImg) {
        doc.addImage(metaphorImg, 'PNG', (pageWidth - 70) / 2, 100, 70, 70);
      }
    } catch {
      console.warn("Could not generate metaphor image for PDF");
    }
  }

  // Metaphor description
  if (result.visualMetaphor) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...C.textSoft);
    const metaphorLines = doc.splitTextToSize(`\u201C${result.visualMetaphor}\u201D`, contentWidth - 40);
    doc.text(metaphorLines, pageWidth / 2, 185, { align: "center" });
  }

  // Date and category
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  drawGoldLine(doc, margin + 40, 220, pageWidth - margin - 40);

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.textMain);
  doc.text(data.category.title.toUpperCase(), pageWidth / 2, 232, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text(dateStr, pageWidth / 2, 240, { align: "center" });

  drawGoldLine(doc, margin, pageHeight - 25, pageWidth - margin);

  doc.setFontSize(7);
  doc.setTextColor(...C.gold);
  doc.text("A sacred document of emotional transformation", pageWidth / 2, pageHeight - 18, { align: "center" });


  // ========================================================
  //  PAGE 2 — REFLECTION
  // ========================================================
  doc.addPage();
  currentPage++;
  setDarkBackground();

  let yPos = addSectionHeader("Reflection", "A mirror held up to your soul", 35);

  // Large opening quote mark in gold
  doc.setFont("times", "normal");
  doc.setFontSize(72);
  doc.setTextColor(...C.gold);
  doc.text("\u201C", margin + 5, yPos + 12);

  // Reflection body
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...C.textMain);
  const reflectionText = doc.splitTextToSize(result.reflection, contentWidth - 25);
  doc.text(reflectionText, margin + 15, yPos + 8, { lineHeightFactor: 1.8 });

  // Closing quote
  const reflectionEndY = yPos + 8 + (reflectionText.length * 7);
  doc.setFont("times", "normal");
  doc.setFontSize(72);
  doc.setTextColor(...C.gold);
  doc.text("\u201D", pageWidth - margin - 15, reflectionEndY + 5);

  addLuxuryFooter(currentPage);


  // ========================================================
  //  PAGE 3 — CLOSURE LETTER
  // ========================================================
  doc.addPage();
  currentPage++;
  setDarkBackground();

  yPos = addSectionHeader("A Message For You", "Words written from the heart", 35);

  // Cream paper rectangle
  const paperX = margin + 5;
  const paperW = contentWidth - 10;
  const paperY = yPos + 5;
  const paperH = pageHeight - paperY - 40;
  doc.setFillColor(...C.cream);
  doc.roundedRect(paperX, paperY, paperW, paperH, 2, 2, "F");

  // Subtle border
  doc.setDrawColor(180, 170, 150);
  doc.setLineWidth(0.2);
  doc.roundedRect(paperX, paperY, paperW, paperH, 2, 2, "D");

  // Gold margin rule
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.4);
  doc.line(paperX + 12, paperY + 15, paperX + 12, paperY + paperH - 15);

  // Salutation
  doc.setFont("times", "italic");
  doc.setTextColor(...C.ink);
  doc.setFontSize(12);
  doc.text("Dearest,", paperX + 18, paperY + 25);

  // Letter body
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 40, 30);
  const closureText = doc.splitTextToSize(result.closureMessage, paperW - 35);
  doc.text(closureText, paperX + 18, paperY + 38, { lineHeightFactor: 1.7 });

  // Sign-off
  const signatureY = paperY + 38 + (closureText.length * 5.5) + 15;
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...C.ink);
  doc.text("With warmth,", paperX + 18, signatureY);
  doc.setFont("times", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...C.gold);
  doc.text("ECHOES", paperX + 18, signatureY + 8);

  // Wax seal
  const sealX = paperX + paperW - 25;
  const sealY = signatureY + 4;
  doc.setFillColor(140, 20, 20);
  doc.circle(sealX, sealY, 8, "F");
  doc.setFillColor(180, 40, 40);
  doc.circle(sealX, sealY, 6, "F");
  doc.setFont("times", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 220, 200);
  doc.text("E", sealX, sealY + 2.5, { align: "center" });

  addLuxuryFooter(currentPage);


  // ========================================================
  //  PAGE 4 — TRANSFORMATION RITUAL
  // ========================================================
  doc.addPage();
  currentPage++;
  setDarkBackground();

  yPos = addSectionHeader("Transformation Ritual", "Three steps toward release", 35);

  const steps = [
    { title: "Physical Action",    desc: result.ritual.step1, num: "I" },
    { title: "Symbolic Release",   desc: result.ritual.step2, num: "II" },
    { title: "Affirmation Anchor", desc: result.ritual.step3, num: "III" },
  ];

  yPos += 10;
  steps.forEach((step) => {
    // Card
    doc.setFillColor(...C.bgLight);
    doc.roundedRect(margin, yPos, contentWidth, 48, 3, 3, "F");

    // Gold left-edge accent
    doc.setFillColor(...C.gold);
    doc.roundedRect(margin, yPos, 2, 48, 1, 1, "F");

    // Roman numeral watermark
    doc.setFont("times", "normal");
    doc.setFontSize(36);
    doc.setTextColor(40, 30, 60);
    doc.text(step.num, pageWidth - margin - 15, yPos + 35, { align: "center" });

    // Step label
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.gold);
    doc.text(step.title.toUpperCase(), margin + 12, yPos + 12);

    // Step description
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...C.textSoft);
    const descLines = doc.splitTextToSize(step.desc, contentWidth - 40);
    doc.text(descLines, margin + 12, yPos + 22, { lineHeightFactor: 1.6 });

    yPos += 56;
  });

  addLuxuryFooter(currentPage);


  // ========================================================
  //  PAGE 5 — AFTERCARE
  // ========================================================
  doc.addPage();
  currentPage++;
  setDarkBackground();

  yPos = addSectionHeader("Gentle Aftercare", "Tending to yourself after the release", 35);

  // Summary
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...C.textSoft);
  const summaryLines = doc.splitTextToSize(result.aftercare.summary, contentWidth - 20);
  doc.text(summaryLines, pageWidth / 2, yPos + 5, { align: "center", lineHeightFactor: 1.6 });

  yPos = yPos + 5 + (summaryLines.length * 7) + 15;
  drawDiamond(doc, pageWidth / 2, yPos, 2);
  yPos += 10;

  // Practice cards
  result.aftercare.practices.forEach(practice => {
    doc.setFillColor(...C.bgLight);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F");

    const typeColors: Record<string, [number, number, number]> = {
      physical: [52, 211, 153],
      reflective: [167, 139, 250],
      social: [251, 191, 36],
    };
    const badgeColor = typeColors[practice.type] ?? C.purple;
    doc.setFillColor(...badgeColor);
    doc.roundedRect(margin, yPos, 2, 30, 1, 1, "F");

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.textMain);
    doc.text(`${practice.icon}  ${practice.title}`, margin + 10, yPos + 10);

    doc.setFontSize(7);
    doc.setTextColor(...badgeColor);
    doc.text(practice.type.toUpperCase(), margin + 10, yPos + 17);

    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.textSoft);
    const practiceDesc = doc.splitTextToSize(practice.description, contentWidth - 25);
    doc.text(practiceDesc, margin + 10, yPos + 24);

    yPos += 35;
  });

  doc.setFont("times", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text("These are gentle suggestions for self-care, not medical advice.", pageWidth / 2, pageHeight - 30, { align: "center" });

  addLuxuryFooter(currentPage);


  // ========================================================
  //  PAGE 6 — EXTRAS (Audio / Drawing / Emotional Arc)
  // ========================================================
  if (result.audioInsight || data.drawing || result.emotionalArc) {
    doc.addPage();
    currentPage++;
    setDarkBackground();

    yPos = addSectionHeader("Deeper Insights", "What lies beneath the surface", 35);

    if (result.audioInsight) {
      doc.setFont("times", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gold);
      doc.text("WHAT YOUR VOICE REVEALED", margin, yPos + 5);

      doc.setFont("times", "italic");
      doc.setFontSize(20);
      doc.setTextColor(...C.goldLight);
      doc.text(result.audioInsight.suggestedLabel, margin, yPos + 18);

      drawGoldLine(doc, margin, yPos + 22, margin + 80);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.textSoft);
      const toneLines = doc.splitTextToSize(`Voice: ${result.audioInsight.toneSummary}`, contentWidth);
      doc.text(toneLines, margin, yPos + 32, { lineHeightFactor: 1.6 });
      yPos = yPos + 32 + (toneLines.length * 6) + 10;

      const wordLines = doc.splitTextToSize(`Words: ${result.audioInsight.wordSummary}`, contentWidth);
      doc.text(wordLines, margin, yPos, { lineHeightFactor: 1.6 });
      yPos += (wordLines.length * 6) + 20;
    }

    if (result.emotionalArc) {
      doc.setFont("times", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gold);
      doc.text("EMOTIONAL JOURNEY", margin, yPos);
      yPos += 8;

      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...C.textSoft);
      const arcSummary = doc.splitTextToSize(result.emotionalArc.narrativeSummary, contentWidth);
      doc.text(arcSummary, margin, yPos, { lineHeightFactor: 1.6 });
      yPos += (arcSummary.length * 6) + 10;

      // Timeline visualization
      result.emotionalArc.segments.forEach((seg, i) => {
        if (yPos > pageHeight - 50) return;

        const sentimentColor: [number, number, number] = seg.sentiment > 0.3
          ? [52, 211, 153]
          : seg.sentiment < -0.3
          ? [239, 68, 68]
          : [167, 139, 250];

        doc.setFillColor(...sentimentColor);
        doc.circle(margin + 5, yPos + 3, 2, "F");

        if (result.emotionalArc && i < result.emotionalArc.segments.length - 1) {
          doc.setDrawColor(50, 50, 70);
          doc.setLineWidth(0.2);
          doc.line(margin + 5, yPos + 5, margin + 5, yPos + 16);
        }

        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...sentimentColor);
        doc.text(seg.label, margin + 12, yPos + 4);

        doc.setFontSize(8);
        doc.setTextColor(...C.textMuted);
        const snippet = seg.text.length > 80 ? seg.text.slice(0, 77) + '...' : seg.text;
        doc.text(`\u201C${snippet}\u201D`, margin + 12, yPos + 10);

        yPos += 18;
      });
      yPos += 10;
    }

    if (data.drawing) {
      if (yPos > pageHeight - 120) {
        addLuxuryFooter(currentPage);
        doc.addPage();
        currentPage++;
        setDarkBackground();
        yPos = 50;
      }

      doc.setFont("times", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gold);
      doc.text("YOUR EMOTIONAL EXPRESSION", margin, yPos);
      yPos += 8;

      const imgSize = 80;
      doc.addImage(data.drawing, 'PNG', margin, yPos, imgSize, imgSize);

      // Gold frame
      doc.setDrawColor(...C.gold);
      doc.setLineWidth(0.3);
      doc.rect(margin - 1, yPos - 1, imgSize + 2, imgSize + 2);
    }

    addLuxuryFooter(currentPage);
  }


  // ========================================================
  //  FINAL PAGE — CLOSING
  // ========================================================
  doc.addPage();
  currentPage++;
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  drawGoldLine(doc, margin + 30, pageHeight / 2 - 30, pageWidth - margin - 30);

  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(...C.goldLight);
  doc.text("You are free now.", pageWidth / 2, pageHeight / 2, { align: "center" });

  drawGoldLine(doc, margin + 30, pageHeight / 2 + 10, pageWidth - margin - 30);

  drawDiamond(doc, pageWidth / 2, pageHeight / 2 + 25, 3);

  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gold);
  doc.text("Created with ECHOES", pageWidth / 2, pageHeight - 35, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(...C.textMuted);
  doc.text(`Emotional Alchemy \u2022 ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - 28, { align: "center" });

  // --- SAVE ---
  doc.save(`echoes-relic-${new Date().toISOString().split('T')[0]}.pdf`);
};

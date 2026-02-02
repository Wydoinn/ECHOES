
import { jsPDF } from "jspdf";
import { TransformationResult, EmotionalData } from '../types';

// Helper to generate an image from the SVG path for the PDF cover
const generateMetaphorImage = async (pathData: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const size = 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Scale path to fit
  const scale = 4;
  ctx.translate(size/2 - (50*scale), size/2 - (50*scale));
  ctx.scale(scale, scale);

  const p = new Path2D(pathData);

  // Outer Glow
  ctx.shadowColor = '#d8b4fe';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(p);

  // Inner Hot White
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.stroke(p);

  return canvas.toDataURL('image/png');
};

export const generateRelicPDF = async (result: TransformationResult, data: EmotionalData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // --- STYLING HELPERS ---
  const colors = {
    bg: "#0D0617",
    textMain: "#FFFFFF",
    textMuted: "#A78BFA", // Purple accent
    textDark: "#4B5563"
  };

  const setDarkBackground = () => {
    doc.setFillColor(13, 6, 23); // #0D0617
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const addFooter = (pageNum: number) => {
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${pageNum} • ECHOES Relic`, pageWidth / 2, pageHeight - 10, { align: "center" });
  };

  const addHeader = (title: string) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250); // Purple
    doc.text(title.toUpperCase(), pageWidth / 2, 15, { align: "center" });
    // Decorative line
    doc.setDrawColor(50, 50, 50);
    doc.line(margin, 20, pageWidth - margin, 20);
  };

  let currentPage = 1;

  // --- PAGE 1: COVER ---
  setDarkBackground();

  // Title
  doc.setFont("times", "normal");
  doc.setFontSize(40);
  doc.setTextColor(colors.textMain);
  doc.text("ECHOES", pageWidth / 2, 60, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(colors.textMuted);
  doc.text("EMOTIONAL RELIC", pageWidth / 2, 70, { align: "center" });

  // Visual Metaphor Image
  if (result.visualMetaphorPath) {
    try {
        const metaphorImg = await generateMetaphorImage(result.visualMetaphorPath);
        doc.addImage(metaphorImg, 'PNG', (pageWidth - 80) / 2, 85, 80, 80);
    } catch {
        console.warn("Could not generate metaphor image for PDF");
    }
  }

  // Info Block
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(dateStr, pageWidth / 2, 180, { align: "center" });

  doc.setFontSize(14);
  doc.text(data.category.title.toUpperCase(), pageWidth / 2, 190, { align: "center" });

  // Icon
  // Note: Standard fonts often don't support colored emojis. We use simple text fallback or standard symbol.
  // Ideally we'd draw the emoji to canvas, but for stability we'll stick to text title.

  addFooter(currentPage);


  // --- PAGE 2: REFLECTION ---
  doc.addPage();
  currentPage++;
  setDarkBackground();
  addHeader("Reflection");

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(colors.textMain);

  // Quote mark
  doc.setFontSize(60);
  doc.setTextColor(colors.textMuted);
  doc.text("“", margin, 50);

  doc.setFontSize(14);
  doc.setTextColor(colors.textMain);
  const reflectionText = doc.splitTextToSize(result.reflection, contentWidth - 20);
  doc.text(reflectionText, margin + 10, 60);

  addFooter(currentPage);


  // --- PAGE 3: CLOSURE LETTER ---
  doc.addPage();
  currentPage++;
  setDarkBackground();
  addHeader("A Message For You");

  // Paper texture effect (lighter rect)
  doc.setFillColor(244, 241, 234); // Cream paper
  doc.rect(margin, 40, contentWidth, pageHeight - 80, "F");

  doc.setFont("times", "italic");
  doc.setTextColor(44, 24, 16); // Dark brown ink
  doc.setFontSize(10);
  doc.text("Dearest,", margin + 15, 60);

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  const closureText = doc.splitTextToSize(result.closureMessage, contentWidth - 30);
  doc.text(closureText, margin + 15, 75);

  doc.setFont("times", "italic");
  doc.text("Sincerely,", margin + 15, 75 + (closureText.length * 6) + 15);
  doc.setFontSize(14);
  doc.text("ECHOES", margin + 15, 75 + (closureText.length * 6) + 22);

  addFooter(currentPage);


  // --- PAGE 4: RITUAL ---
  doc.addPage();
  currentPage++;
  setDarkBackground();
  addHeader("Transformation Ritual");

  const steps = [
      { title: "Physical Action", desc: result.ritual.step1 },
      { title: "Symbolic Release", desc: result.ritual.step2 },
      { title: "Affirmation Anchor", desc: result.ritual.step3 },
  ];

  let yPos = 50;
  steps.forEach((step, i) => {
      // Step Box
      doc.setDrawColor(167, 139, 250);
      doc.setFillColor(26, 11, 46);
      doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, "FD");

      // Number
      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.setTextColor(50, 50, 50); // Watermark number
      doc.text(`${i + 1}`, margin + 10, yPos + 30);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(colors.textMuted);
      doc.text(step.title.toUpperCase(), margin + 25, yPos + 12);

      // Desc
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(colors.textMain);
      const descLines = doc.splitTextToSize(step.desc, contentWidth - 40);
      doc.text(descLines, margin + 25, yPos + 22);

      yPos += 50;
  });

  addFooter(currentPage);


  // --- PAGE 5: AFTERCARE ---
  doc.addPage();
  currentPage++;
  setDarkBackground();
  addHeader("Gentle Aftercare");

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  const summaryLines = doc.splitTextToSize(result.aftercare.summary, contentWidth);
  doc.text(summaryLines, margin, 40);

  yPos = 40 + (summaryLines.length * 6) + 15;

  result.aftercare.practices.forEach(p => {
    // Mini Card
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "D");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.textMain);
    doc.text(p.title, margin + 5, yPos + 8);

    // Type
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted);
    doc.text(p.type.toUpperCase(), margin + 5, yPos + 20);

    // Desc
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(p.description, margin + 60, yPos + 10, { maxWidth: contentWidth - 70 });

    yPos += 30;
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("These are gentle suggestions, not medical advice.", pageWidth/2, pageHeight - 20, { align: "center" });

  addFooter(currentPage);


  // --- PAGE 6: EXTRAS (Audio/Drawing) ---
  if (result.audioInsight || data.drawing) {
      doc.addPage();
      currentPage++;
      setDarkBackground();
      addHeader("Insights & Expression");

      yPos = 40;

      if (result.audioInsight) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(colors.textMuted);
          doc.text("WHAT YOUR VOICE REVEALED", margin, yPos);
          yPos += 10;

          doc.setFontSize(16);
          doc.setTextColor(colors.textMain);
          doc.text(result.audioInsight.suggestedLabel, margin, yPos);
          yPos += 10;

          doc.setFont("times", "normal");
          doc.setFontSize(11);
          doc.setTextColor(200, 200, 200);
          const toneText = doc.splitTextToSize(result.audioInsight.toneSummary, contentWidth);
          doc.text(toneText, margin, yPos);
          yPos += (toneText.length * 6) + 20;
      }

      if (data.drawing) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(colors.textMuted);
          doc.text("YOUR EMOTIONAL EXPRESSION", margin, yPos);
          yPos += 10;

          const imgWidth = 100;
          const imgHeight = 100;

          doc.addImage(data.drawing, 'PNG', margin, yPos, imgWidth, imgHeight);

          // Frame
          doc.setDrawColor(100, 100, 100);
          doc.rect(margin, yPos, imgWidth, imgHeight);
      }

      addFooter(currentPage);
  }


  // --- FINAL PAGE: CLOSING ---
  doc.addPage();
  setDarkBackground();

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(colors.textMain);
  doc.text("You are free now.", pageWidth / 2, pageHeight / 2, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Created with ECHOES", pageWidth / 2, pageHeight - 30, { align: "center" });


  // --- SAVE ---
  doc.save(`echoes-relic-${new Date().toISOString().split('T')[0]}.pdf`);
};

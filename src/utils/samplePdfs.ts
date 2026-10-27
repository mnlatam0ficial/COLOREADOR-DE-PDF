/**
 * Generates high-fidelity Black & White sample documents for immediate colorization testing.
 */

export interface SampleDocMeta {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  suggestedPreset: 'blueprint' | 'corporate' | 'comic' | 'vintage';
}

export const SAMPLE_DOCS: SampleDocMeta[] = [
  {
    id: 'blueprint',
    name: 'Plano Arquitectónico Residencial',
    badge: 'Plano Técnico',
    category: 'Arquitectura',
    description: 'Plano en escala de grises con sala, cocina, terraza, jardín exterior y cotas.',
    suggestedPreset: 'blueprint',
  },
  {
    id: 'corporate',
    name: 'Reporte Ejecutivo & Dashboard Q4',
    badge: 'Documento / Gráficos',
    category: 'Negocios',
    description: 'Informe corporativo con gráficos de barras, métricas KPI, tablas y firmas.',
    suggestedPreset: 'corporate',
  },
  {
    id: 'comic',
    name: 'Ilustración Manga & Paisaje Oriental',
    badge: 'Lineart / Manga',
    category: 'Arte & Cómic',
    description: 'Dibujo de líneas en blanco y negro con personaje, templo pagoda y cerezos.',
    suggestedPreset: 'comic',
  },
  {
    id: 'vintage',
    name: 'Grabado Botánico & Naturaleza (1890)',
    badge: 'Grabado Antiguo',
    category: 'Histórico',
    description: 'Placa de herbario clásico con orquídeas tropicales, colibrí y tipografía victoriana.',
    suggestedPreset: 'vintage',
  },
];

export async function generateSampleDocument(id: string): Promise<{ dataUrl: string; name: string; width: number; height: number }> {
  const width = 1200;
  const height = 1600; // ~A4 ratio (1:1.33 or 1:1.41)
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Background white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  if (id === 'blueprint') {
    drawBlueprintSample(ctx, width, height);
  } else if (id === 'corporate') {
    drawCorporateSample(ctx, width, height);
  } else if (id === 'comic') {
    drawComicSample(ctx, width, height);
  } else {
    drawVintageSample(ctx, width, height);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const sampleMeta = SAMPLE_DOCS.find((s) => s.id === id) || SAMPLE_DOCS[0];
  return {
    dataUrl,
    name: `${sampleMeta.name}.pdf`,
    width,
    height,
  };
}

function drawBlueprintSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Border & Grid
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 60; x < w - 60; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, h - 160);
    ctx.stroke();
  }
  for (let y = 100; y < h - 160; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(w - 60, y);
    ctx.stroke();
  }

  // Header Title Block
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PROYECTO: RESIDENCIA VILLA HERMOSA - NIVEL 1', 70, 70);
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('PLANO ARQUITECTÓNICO • ESCALA 1:50 • FECHA: OCTUBRE 2026 • LÁMINA A-101', 70, 95);

  // Outer thick walls
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#1F2937';
  const planX = 140;
  const planY = 160;
  const planW = 920;
  const planH = 1050;
  ctx.strokeRect(planX, planY, planW, planH);

  // Interior walls (partitioning)
  ctx.lineWidth = 7;
  // Horizontal dividing wall
  ctx.beginPath();
  ctx.moveTo(planX, planY + 450);
  ctx.lineTo(planX + planW - 300, planY + 450);
  ctx.stroke();

  // Vertical wall separating kitchen and living
  ctx.beginPath();
  ctx.moveTo(planX + 420, planY);
  ctx.lineTo(planX + 420, planY + 450);
  ctx.stroke();

  // Vertical wall for bedrooms
  ctx.beginPath();
  ctx.moveTo(planX + 580, planY + 450);
  ctx.lineTo(planX + 580, planY + planH);
  ctx.stroke();

  // Bathroom wall
  ctx.beginPath();
  ctx.moveTo(planX, planY + 750);
  ctx.lineTo(planX + 320, planY + 750);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(planX + 320, planY + 450);
  ctx.lineTo(planX + 320, planY + 750);
  ctx.stroke();

  // Terrace / Garden area (right column)
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(planX + planW - 280, planY + 50, 240, 350);
  ctx.setLineDash([]);

  // Furniture & Room details (Lineart)
  // Living Room Sofa
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#374151';
  ctx.strokeRect(planX + 60, planY + 120, 260, 90);
  ctx.strokeRect(planX + 70, planY + 130, 240, 40);
  ctx.strokeRect(planX + 130, planY + 240, 120, 70); // coffee table

  // Kitchen counter & sink
  ctx.strokeRect(planX + 440, planY + 20, 420, 70);
  ctx.strokeRect(planX + 800, planY + 90, 60, 260);
  // Stove circles
  ctx.beginPath();
  ctx.arc(planX + 520, planY + 55, 18, 0, Math.PI * 2);
  ctx.arc(planX + 580, planY + 55, 18, 0, Math.PI * 2);
  ctx.stroke();

  // Dining table & chairs
  ctx.strokeRect(planX + 520, planY + 210, 180, 100);
  for (let i = 0; i < 4; i++) {
    ctx.strokeRect(planX + 540 + i * 36, planY + 180, 25, 20);
    ctx.strokeRect(planX + 540 + i * 36, planY + 320, 25, 20);
  }

  // Master Bedroom Bed
  ctx.strokeRect(planX + 640, planY + 540, 200, 240);
  ctx.strokeRect(planX + 660, planY + 550, 75, 50); // Pillow 1
  ctx.strokeRect(planX + 745, planY + 550, 75, 50); // Pillow 2
  ctx.strokeRect(planX + 600, planY + 540, 30, 40); // Nightstand
  ctx.strokeRect(planX + 850, planY + 540, 30, 40);

  // Bathroom Tub & Toilet
  ctx.strokeRect(planX + 40, planY + 480, 180, 90);
  ctx.beginPath();
  ctx.ellipse(planX + 130, planY + 525, 75, 30, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Patio / Garden trees & pool
  ctx.strokeRect(planX + 640, planY + 860, 220, 150);
  ctx.font = 'italic 16px sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('~ PISCINA / JACUZZI ~', planX + 670, planY + 940);

  // Tree symbols (radiating lines)
  function drawTree(tx: number, ty: number, r: number) {
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(a) * r, ty + Math.sin(a) * r);
      ctx.stroke();
    }
  }
  drawTree(planX + 960, planY + 580, 40);
  drawTree(planX + 960, planY + 740, 50);
  drawTree(planX + 960, planY + 900, 45);

  // Room Labels
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SALA PRINCIPAL', planX + 100, planY + 360);
  ctx.fillText('COCINA & COMEDOR', planX + 510, planY + 380);
  ctx.fillText('BAÑO COMPLETO', planX + 60, planY + 680);
  ctx.fillText('DORMITORIO MASTER', planX + 640, planY + 820);
  ctx.fillText('JARDÍN & TERRAZA EXTERIOR', planX + planW - 270, planY + 400);

  // Dimension lines with arrows
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#4B5563';
  ctx.beginPath();
  ctx.moveTo(planX, planY + planH + 40);
  ctx.lineTo(planX + planW, planY + planH + 40);
  ctx.stroke();
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1F2937';
  ctx.fillText('◄───────── TOTAL: 14.50 METROS ─────────►', planX + 270, planY + planH + 65);

  // Footer Legend Box
  ctx.lineWidth = 2;
  ctx.strokeRect(60, h - 130, w - 120, 90);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('SIMBOLOGÍA & NOTAS GENERALES', 80, h - 100);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('1. Muros estructurales de carga de 25cm.  2. Ventanería con perfil de aluminio anodizado.  3. Ver especificaciones eléctricas en plano IE-02.', 80, h - 70);
}

function drawCorporateSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Top header bar (grayscale)
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(60, 60, w - 120, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('GLOBAL NEXUS CAPITAL • INFORME TRIMESTRAL Q4', 90, 110);

  // Subtitle
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Resultados Financieros y Desempeño Operativo', 60, 195);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Periodo fiscal cerrado al 30 de Septiembre. Preparado para la Junta Directiva.', 60, 225);

  // 3 Metric Cards (in B&W)
  const cardW = 320;
  const cardH = 140;
  const metrics = [
    { label: 'INGRESOS BRUTOS', val: '$48.5M', change: '+24.3% YoY' },
    { label: 'MARGEN OPERATIVO', val: '31.8%', change: '+3.5 pts' },
    { label: 'CLIENTES ACTIVOS', val: '142,800', change: '+18.1% nuevos' },
  ];

  metrics.forEach((m, i) => {
    const x = 60 + i * (cardW + 40);
    const y = 260;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardW, cardH);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x + 1, y + 1, cardW - 2, cardH - 2);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(m.label, x + 25, y + 40);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(m.val, x + 25, y + 90);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText(`▲ ${m.change}`, x + 25, y + 120);
  });

  // Chart 1: Bar Chart (Monochrome shades of gray)
  const chart1Y = 440;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Evolución de Ingresos por División (MUSD)', 60, chart1Y);

  const barX = 120;
  const barY = chart1Y + 40;
  const barW = 500;
  const barH = 280;

  // Axes
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(barX, barY);
  ctx.lineTo(barX, barY + barH);
  ctx.lineTo(barX + barW, barY + barH);
  ctx.stroke();

  // Grid lines
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#E2E8F0';
  for (let step = 0; step <= 4; step++) {
    const gy = barY + barH - (barH / 4) * step;
    ctx.beginPath();
    ctx.moveTo(barX, gy);
    ctx.lineTo(barX + barW, gy);
    ctx.stroke();
    ctx.fillStyle = '#64748B';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`$${step * 15}M`, barX - 50, gy + 4);
  }
  ctx.setLineDash([]);

  // Bars (Gray gradients / stripes)
  const divisions = [
    { name: 'Cloud SaaS', val: 0.85, fill: '#334155' },
    { name: 'Fintech', val: 0.65, fill: '#64748B' },
    { name: 'Consultoría', val: 0.45, fill: '#94A3B8' },
    { name: 'Hardware', val: 0.3, fill: '#CBD5E1' },
    { name: 'IA / Datos', val: 0.95, fill: '#1E293B' },
  ];

  const colWidth = 65;
  divisions.forEach((d, i) => {
    const bx = barX + 35 + i * 90;
    const bh = barH * d.val;
    const by = barY + barH - bh;
    ctx.fillStyle = d.fill;
    ctx.fillRect(bx, by, colWidth, bh);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, colWidth, bh);

    // Label
    ctx.fillStyle = '#334155';
    ctx.font = '12px sans-serif';
    ctx.fillText(d.name, bx - 5, barY + barH + 24);
  });

  // Chart 2: Donut Chart (Monochrome segments)
  const donutCX = 880;
  const donutCY = chart1Y + 160;
  const outerR = 110;
  const innerR = 60;
  const segments = [
    { p: 0.4, fill: '#1E293B', label: 'Norteamérica 40%' },
    { p: 0.3, fill: '#475569', label: 'Europa 30%' },
    { p: 0.2, fill: '#94A3B8', label: 'Latinoamérica 20%' },
    { p: 0.1, fill: '#E2E8F0', label: 'Asia 10%' },
  ];

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Distribución Geográfica', 760, chart1Y);

  let currentAngle = -Math.PI / 2;
  segments.forEach((seg) => {
    const sweep = seg.p * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(donutCX, donutCY, outerR, currentAngle, currentAngle + sweep);
    ctx.arc(donutCX, donutCY, innerR, currentAngle + sweep, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.fill;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    currentAngle += sweep;
  });

  // Legend for donut
  segments.forEach((seg, i) => {
    const ly = donutCY + outerR + 30 + i * 22;
    ctx.fillStyle = seg.fill;
    ctx.fillRect(770, ly - 12, 16, 16);
    ctx.strokeStyle = '#0F172A';
    ctx.strokeRect(770, ly - 12, 16, 16);
    ctx.fillStyle = '#334155';
    ctx.font = '14px sans-serif';
    ctx.fillText(seg.label, 800, ly + 2);
  });

  // Table at bottom
  const tableY = 880;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Resumen de Rendimiento por Unidad de Negocio', 60, tableY);

  // Table Header
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(60, tableY + 20, w - 120, 45);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, tableY + 20, w - 120, 45);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('UNIDAD OPERATIVA', 80, tableY + 48);
  ctx.fillText('INGRESOS (M$)', 400, tableY + 48);
  ctx.fillText('EBITDA', 620, tableY + 48);
  ctx.fillText('MARGEN', 820, tableY + 48);
  ctx.fillText('ESTADO', 980, tableY + 48);

  const rows = [
    ['Infraestructura Cloud AI', '$18.4M', '$6.2M', '33.7%', 'SUPERADO'],
    ['Soluciones Financieras B2B', '$14.1M', '$4.8M', '34.0%', 'EN META'],
    ['Ciberseguridad Empresarial', '$9.8M', '$2.9M', '29.5%', 'EN META'],
    ['Consultoría y Transformación', '$6.2M', '$1.4M', '22.5%', 'MODERADO'],
  ];

  rows.forEach((r, idx) => {
    const ry = tableY + 65 + idx * 45;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, ry, w - 120, 45);
    ctx.strokeRect(60, ry, w - 120, 45);

    ctx.fillStyle = '#1E293B';
    ctx.font = '500 15px sans-serif';
    ctx.fillText(r[0], 80, ry + 28);
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillText(r[1], 400, ry + 28);
    ctx.fillText(r[2], 620, ry + 28);
    ctx.fillText(r[3], 820, ry + 28);

    // Status pill
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(970, ry + 10, 100, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(r[4], 985, ry + 27);
  });

  // Footer & Signatures
  const footY = h - 180;
  ctx.strokeStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(120, footY + 60);
  ctx.lineTo(400, footY + 60);
  ctx.moveTo(700, footY + 60);
  ctx.lineTo(980, footY + 60);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '14px sans-serif';
  ctx.fillText('Director General (CEO)', 180, footY + 85);
  ctx.fillText('Director Financiero (CFO)', 760, footY + 85);

  ctx.font = 'italic 12px sans-serif';
  ctx.fillText('Documento confidencial para uso interno de accionistas. Impreso en monocromo.', 60, h - 30);
}

function drawComicSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Comic manga lineart style with dynamic borders
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 6;
  ctx.strokeRect(50, 50, w - 100, h - 100);

  // Top banner with Japanese / Manga style title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('CRÓNICAS DE KYOTO • 桜の伝説', 70, 110);
  ctx.font = 'italic 18px sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('Capítulo 14: El Guardián del Monte Sagrado (Lineart Manga Original)', 70, 145);

  // Big dramatic panel 1
  const panel1Y = 170;
  const panel1H = 750;
  ctx.lineWidth = 4;
  ctx.strokeRect(70, panel1Y, w - 140, panel1H);

  // Mountain Fuji background outline
  ctx.beginPath();
  ctx.moveTo(80, panel1Y + 450);
  ctx.lineTo(w / 2, panel1Y + 120);
  ctx.lineTo(w - 80, panel1Y + 480);
  ctx.stroke();

  // Snow cap hatching
  ctx.beginPath();
  ctx.moveTo(w / 2 - 70, panel1Y + 220);
  ctx.lineTo(w / 2, panel1Y + 190);
  ctx.lineTo(w / 2 + 70, panel1Y + 230);
  ctx.stroke();

  // Sun outline
  ctx.beginPath();
  ctx.arc(w / 2, panel1Y + 280, 120, 0, Math.PI * 2);
  ctx.stroke();

  // Pagoda temple silhouette / lineart
  const pagX = 220;
  const pagY = panel1Y + 280;
  for (let tier = 0; tier < 3; tier++) {
    const ty = pagY + tier * 80;
    const tw = 200 - tier * 40;
    // Roof curve
    ctx.beginPath();
    ctx.moveTo(pagX - tw / 2, ty + 40);
    ctx.quadraticCurveTo(pagX, ty + 10, pagX + tw / 2, ty + 40);
    ctx.stroke();
    // Pillars
    ctx.strokeRect(pagX - tw / 2 + 25, ty + 40, tw - 50, 40);
  }

  // Sakura cherry blossom branch creeping from top right
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w - 70, panel1Y + 50);
  ctx.bezierCurveTo(w - 250, panel1Y + 80, w - 280, panel1Y + 220, w - 450, panel1Y + 180);
  ctx.stroke();

  // Blossom petals
  function drawFlower(fx: number, fy: number, r: number) {
    ctx.lineWidth = 2;
    for (let p = 0; p < 5; p++) {
      const angle = (p * Math.PI * 2) / 5;
      const px = fx + Math.cos(angle) * r;
      const py = fy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(fx, fy, r * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawFlower(w - 200, panel1Y + 80, 18);
  drawFlower(w - 280, panel1Y + 140, 22);
  drawFlower(w - 360, panel1Y + 110, 16);
  drawFlower(w - 420, panel1Y + 190, 20);
  drawFlower(w - 150, panel1Y + 150, 15);

  // Manga Hero Character in Foreground (Lineart)
  const charX = w / 2 + 120;
  const charY = panel1Y + panel1H - 40;

  // Head & Hair
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(charX, charY - 350, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Spiky hair
  ctx.beginPath();
  ctx.moveTo(charX - 50, charY - 360);
  ctx.lineTo(charX - 80, charY - 420);
  ctx.lineTo(charX - 30, charY - 390);
  ctx.lineTo(charX, charY - 440);
  ctx.lineTo(charX + 40, charY - 390);
  ctx.lineTo(charX + 75, charY - 425);
  ctx.lineTo(charX + 50, charY - 350);
  ctx.stroke();

  // Katana sword
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(charX - 160, charY - 120);
  ctx.lineTo(charX + 180, charY - 420);
  ctx.stroke();
  // Katana guard
  ctx.strokeRect(charX - 60, charY - 215, 25, 12);

  // Kimono / Haori outlines
  ctx.beginPath();
  ctx.moveTo(charX - 30, charY - 300);
  ctx.lineTo(charX - 130, charY - 100);
  ctx.lineTo(charX - 80, charY);
  ctx.lineTo(charX + 80, charY);
  ctx.lineTo(charX + 130, charY - 100);
  ctx.lineTo(charX + 30, charY - 300);
  ctx.closePath();
  ctx.stroke();

  // Screentone / Speed lines (action lines)
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const sx = 80 + i * 45;
    ctx.beginPath();
    ctx.moveTo(sx, panel1Y + 650);
    ctx.lineTo(sx + 15, panel1Y + panel1H - 10);
    ctx.stroke();
  }

  // Dialogue bubble
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(w - 260, panel1Y + 360, 140, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('¡EL PODER DEL', w - 340, panel1Y + 350);
  ctx.fillText('COLOR DESPIERTA!', w - 355, panel1Y + 380);

  // Bottom 2 panels
  const botY = panel1Y + panel1H + 30;
  const botH = h - botY - 80;
  const halfW = (w - 170) / 2;

  // Panel 2 left
  ctx.strokeRect(70, botY, halfW, botH);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('PANEL 2: VISTA CERCANA', 90, botY + 40);
  // Eye close-up
  ctx.beginPath();
  ctx.arc(70 + halfW / 2, botY + botH / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(70 + halfW / 2, botY + botH / 2, 25, 0, Math.PI * 2);
  ctx.stroke();

  // Panel 3 right
  ctx.strokeRect(70 + halfW + 30, botY, halfW, botH);
  ctx.fillText('PANEL 3: ACCIÓN FINAL', 70 + halfW + 50, botY + 40);
  // Impact burst
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(70 + halfW + 30 + halfW / 2, botY + botH / 2);
    ctx.lineTo(
      70 + halfW + 30 + halfW / 2 + Math.cos(a) * 120,
      botY + botH / 2 + Math.sin(a) * 100
    );
    ctx.stroke();
  }
}

function drawVintageSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Ornate classical engraving plate (1890 botanical etching)
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 8;
  ctx.strokeRect(50, 50, w - 100, h - 100);

  // Inner decorative border
  ctx.lineWidth = 1.5;
  ctx.strokeRect(65, 65, w - 130, h - 130);

  // Corner ornaments
  function drawCorner(cx: number, cy: number, signX: number, signY: number) {
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + signX * 12, cy + signY * 12, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawCorner(75, 75, 1, 1);
  drawCorner(w - 75, 75, -1, 1);
  drawCorner(75, h - 75, 1, -1);
  drawCorner(w - 75, h - 75, -1, -1);

  // Title in Victorian typography
  ctx.fillStyle = '#18181B';
  ctx.font = 'italic 20px "Times New Roman", serif';
  ctx.fillText('HISTORIA NATURALIS • TABULA CCLIV', w / 2 - 180, 115);

  ctx.font = 'bold 36px "Times New Roman", serif';
  ctx.fillText('FLORA & FAUNA TROPICALIS', w / 2 - 270, 160);

  ctx.font = 'italic 16px "Times New Roman", serif';
  ctx.fillStyle = '#52525B';
  ctx.fillText('Archivum Regium Botanicum • Edición Monocromática de Grabado en Cobre (1890)', w / 2 - 275, 190);

  // Large central botanical illustration with dense etching lines
  const centerX = w / 2;
  const centerY = h / 2 - 20;

  // Stems & Leaves with hatching
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 3;

  // Central winding stem
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY + 380);
  ctx.bezierCurveTo(centerX - 120, centerY + 180, centerX + 100, centerY + 50, centerX - 40, centerY - 200);
  ctx.stroke();

  // Large tropical leaves with detailed veins
  function drawLeaf(lx: number, ly: number, angle: number, scale: number) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(80 * scale, -40 * scale, 180 * scale, 0);
    ctx.quadraticCurveTo(80 * scale, 40 * scale, 0, 0);
    ctx.stroke();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(180 * scale, 0);
    ctx.stroke();

    // Side veins (hatching)
    ctx.lineWidth = 1;
    for (let v = 20; v < 170 * scale; v += 15) {
      ctx.beginPath();
      ctx.moveTo(v, 0);
      ctx.lineTo(v + 15, -20 * scale);
      ctx.moveTo(v, 0);
      ctx.lineTo(v + 15, 20 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLeaf(centerX - 90, centerY + 240, -0.6, 1.4);
  drawLeaf(centerX - 20, centerY + 160, 0.4, 1.3);
  drawLeaf(centerX - 70, centerY + 20, -0.8, 1.2);
  drawLeaf(centerX + 30, centerY - 60, 0.5, 1.1);

  // Exotic Orchid / Hibiscus flowers
  function drawDetailedFlower(fx: number, fy: number, scale: number) {
    ctx.lineWidth = 2.5;
    for (let pet = 0; pet < 6; pet++) {
      const pAngle = (pet * Math.PI * 2) / 6;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(pAngle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(30 * scale, -45 * scale, 80 * scale, -30 * scale, 110 * scale, 0);
      ctx.bezierCurveTo(80 * scale, 30 * scale, 30 * scale, 45 * scale, 0, 0);
      ctx.stroke();

      // Delicate shading lines
      ctx.lineWidth = 1;
      for (let s = 20; s < 90 * scale; s += 12) {
        ctx.beginPath();
        ctx.moveTo(s, -10 * scale);
        ctx.lineTo(s + 10, 10 * scale);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Flower center
    ctx.beginPath();
    ctx.arc(fx, fy, 22 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawDetailedFlower(centerX - 40, centerY - 200, 1.1);
  drawDetailedFlower(centerX + 160, centerY - 10, 0.9);
  drawDetailedFlower(centerX - 240, centerY + 80, 0.85);

  // Hummingbird feeding
  const birdX = centerX + 180;
  const birdY = centerY - 160;

  ctx.lineWidth = 2.5;
  // Body & Head
  ctx.beginPath();
  ctx.ellipse(birdX, birdY, 35, 20, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  // Long beak pointing to flower
  ctx.beginPath();
  ctx.moveTo(birdX - 25, birdY - 15);
  ctx.lineTo(birdX - 110, birdY - 50);
  ctx.stroke();
  // Wings with feather texture
  ctx.beginPath();
  ctx.moveTo(birdX + 10, birdY - 15);
  ctx.bezierCurveTo(birdX + 50, birdY - 90, birdX + 110, birdY - 70, birdX + 80, birdY - 20);
  ctx.stroke();

  // Botanical Descriptions at Bottom
  const descY = h - 180;
  ctx.fillStyle = '#18181B';
  ctx.font = 'bold 18px "Times New Roman", serif';
  ctx.fillText('FIG. 1. Orchidaceae spectabilis (Ventenat)', 100, descY);
  ctx.fillText('FIG. 2. Trochilus polytmus (Linnaeus)', 680, descY);

  ctx.font = '14px "Times New Roman", serif';
  ctx.fillStyle = '#52525B';
  ctx.fillText('Especímenes colectados en la expedición botánica neotropical de 1888.', 100, descY + 25);
  ctx.fillText('Grabado calcográfico preservado en la biblioteca botánica nacional.', 680, descY + 25);

  // Stamp / Wax seal imitation in monochrome
  ctx.beginPath();
  ctx.arc(w - 180, descY + 20, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('SELLO OFICIAL', w - 215, descY + 18);
  ctx.fillText('ARCHIVO 1890', w - 215, descY + 32);
}

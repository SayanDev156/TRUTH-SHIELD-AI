const fs = require('fs');
const zlib = require('zlib');

const W = 32, H = 32;
const pixels = new Uint8Array(W * H * 4);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  const sa = a / 255, da = pixels[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return;
  pixels[i]     = Math.round((r * sa + pixels[i]     * da * (1 - sa)) / oa);
  pixels[i + 1] = Math.round((g * sa + pixels[i + 1] * da * (1 - sa)) / oa);
  pixels[i + 2] = Math.round((b * sa + pixels[i + 2] * da * (1 - sa)) / oa);
  pixels[i + 3] = Math.round(oa * 255);
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

const radius = 7;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = (x + y) / (W + H);
    const r = lerp(0x3A, 0xFF, t * 0.5);
    const g = lerp(0xBE, 0x5E, t * 0.5);
    const b = lerp(0xFF, 0xA8, t * 0.5);

    const dx = Math.max(radius - x, 0, x - (W - 1 - radius));
    const dy = Math.max(radius - y, 0, y - (H - 1 - radius));
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius + 0.5) continue;
    const alpha = dist > radius - 0.5 ? Math.round((radius + 0.5 - dist) * 255) : 255;

    setPixel(x, y, r, g, b, alpha);
  }
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (pixels[i + 3] > 0) setPixel(x, y, 5, 8, 22, 100);
  }
}

function drawLine(x0, y0, x1, y1, r, g, b, a, thick = 1) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x0 + dx * t, py = y0 + dy * t;
    for (let ox = -thick; ox <= thick; ox++) {
      for (let oy = -thick; oy <= thick; oy++) {
        if (ox * ox + oy * oy <= thick * thick)
          setPixel(Math.round(px + ox), Math.round(py + oy), r, g, b, a);
      }
    }
  }
}

function drawEllipse(cx, cy, rx, ry, r, g, b, a) {
  for (let angle = 0; angle < 360; angle += 0.5) {
    const rad = angle * Math.PI / 180;
    const x = cx + rx * Math.cos(rad);
    const y = cy + ry * Math.sin(rad);
    setPixel(Math.round(x), Math.round(y), r, g, b, a);
    setPixel(Math.round(x) + 1, Math.round(y), r, g, b, Math.round(a * 0.5));
  }
}

function fillCircle(cx, cy, radius, r, g, b, a) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const dist = Math.sqrt(x * x + y * y);
      if (dist <= radius) {
        const aa = dist > radius - 1 ? Math.round((radius - dist) * a) : a;
        setPixel(Math.round(cx + x), Math.round(cy + y), r, g, b, aa);
      }
    }
  }
}

const shield = [
  [16,4],[7,7.8],[7,13],[8,16],[10,19],[13,22],[16,24],
  [19,22],[22,19],[24,16],[25,13],[25,7.8],[16,4]
];
for (let i = 0; i < shield.length - 1; i++) {
  drawLine(shield[i][0], shield[i][1], shield[i+1][0], shield[i+1][1], 255, 255, 255, 220, 0);
}

drawEllipse(16, 15, 5, 3.2, 255, 255, 255, 240);

fillCircle(16, 15, 2, 255, 255, 255, 255);

drawLine(9, 15, 11, 15, 58, 190, 255, 230, 0);
drawLine(21, 15, 23, 15, 58, 190, 255, 230, 0);

drawLine(16, 9, 16, 11, 255, 255, 255, 160, 0);

function encodePNG(width, height, pixels) {
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.concat([typeBytes, data]);
    const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf));
    return Buffer.concat([len, typeBytes, data, crcVal]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const png = encodePNG(W, H, pixels);
fs.writeFileSync('public/favicon.png', png);
fs.writeFileSync('public/favicon.ico', png);
console.log('✓ favicon.png and favicon.ico written to public/');

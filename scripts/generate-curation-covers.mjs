#!/usr/bin/env node
/**
 * Generate reusable topic cover images for curated home feeds.
 * Uses MiniMax image-01 when MINIMAX_API_KEY is set; otherwise writes SVG fallbacks.
 *
 * Usage: node scripts/generate-curation-covers.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDirs = [
  path.join(repoRoot, 'apps/web-io/public/curation'),
  path.join(repoRoot, 'apps/web-org/public/curation'),
];

loadEnvFile(path.join(repoRoot, '.env'));

const STYLE =
  'Editorial abstract cover art for a premium knowledge website. Muted palette, subtle paper grain, minimal geometric composition, no text, no letters, no people, no faces, no logos. Calm refined museum-catalog aesthetic, soft diffused light.';

const ASSETS = [
  {
    file: 'cornerstone',
    ext: 'jpg',
    aspect_ratio: '16:9',
    prompt: `${STYLE} Warm stone and cream tones. Layered translucent planes suggesting operating-model change and organizational structure, not technology hype.`,
  },
  {
    file: 'three-gaps',
    ext: 'jpg',
    aspect_ratio: '3:2',
    prompt: `${STYLE} Warm taupe palette. Three horizontal strata with subtle luminous gaps between them — metaphor for work, governance, and value measurement.`,
  },
  {
    file: 'roadmap',
    ext: 'jpg',
    aspect_ratio: '3:2',
    prompt: `${STYLE} Sage green and stone palette. Abstract ascending path with seven small markers or terraces, suggesting a multi-stage transformation roadmap.`,
  },
  {
    file: 'harvest-stories',
    ext: 'jpg',
    aspect_ratio: '3:2',
    prompt: `${STYLE} Soft muted green and parchment tones. Abstract open field notebook, marginal notes, and thread lines — community field experiences, not journalism.`,
  },
  {
    file: 'apprenticeship',
    ext: 'jpg',
    aspect_ratio: '3:2',
    prompt: `${STYLE} Warm wood and linen tones. Abstract workbench, tools, and judgment craft — mentorship and hands-on learning, no people visible.`,
  },
  {
    file: 'path-governance',
    ext: 'jpg',
    aspect_ratio: '1:1',
    prompt: `${STYLE} Square icon composition. Minimal compass horizon and balanced pillars — executive governance and sponsorship.`,
  },
  {
    file: 'path-playbook',
    ext: 'jpg',
    aspect_ratio: '1:1',
    prompt: `${STYLE} Square icon composition. Connected nodes and practical patterns — implementation and enablement work.`,
  },
  {
    file: 'path-explore',
    ext: 'jpg',
    aspect_ratio: '1:1',
    prompt: `${STYLE} Square icon composition. Soft doorway light and open horizon — exploration and first steps.`,
  },
  {
    file: 'path-share',
    ext: 'jpg',
    aspect_ratio: '1:1',
    prompt: `${STYLE} Square icon composition in soft green. Overlapping conversation threads and shared notes — community contribution.`,
  },
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function svgFallback(asset) {
  const palettes = {
    cornerstone: ['#e8e4dc', '#c4b8a8', '#8b7355'],
    'three-gaps': ['#e5dfd6', '#b8aea0', '#78716c'],
    roadmap: ['#dce8e0', '#9bb5a4', '#5c7a68'],
    'harvest-stories': ['#e8f0ea', '#8fb89a', '#3d7a5c'],
    apprenticeship: ['#ebe4d8', '#c9a882', '#8b6914'],
    'path-governance': ['#e8e4dc', '#8b7355'],
    'path-playbook': ['#dfe4ea', '#6b7280'],
    'path-explore': ['#f0ebe3', '#a89882'],
    'path-share': ['#e8f0ea', '#3d7a5c'],
  };
  const [a, b, c = b] = palettes[asset.file] ?? ['#e8e4dc', '#c4b8a8'];
  const isSquare = asset.aspect_ratio === '1:1';
  const w = isSquare ? 400 : asset.aspect_ratio === '16:9' ? 960 : 900;
  const h = isSquare ? 400 : asset.aspect_ratio === '16:9' ? 540 : 600;

  let shapes = '';
  if (asset.file === 'three-gaps') {
    shapes = `
      <rect x="80" y="120" width="740" height="90" fill="${a}" opacity="0.9"/>
      <rect x="80" y="240" width="740" height="90" fill="${b}" opacity="0.85"/>
      <rect x="80" y="360" width="740" height="90" fill="${c}" opacity="0.8"/>
      <rect x="80" y="210" width="740" height="8" fill="#faf9f7" opacity="0.7"/>
      <rect x="80" y="330" width="740" height="8" fill="#faf9f7" opacity="0.7"/>`;
  } else if (asset.file === 'roadmap') {
    shapes = `
      <path d="M120 480 L220 420 L320 390 L420 340 L520 280 L620 220 L720 160 L780 120" stroke="${c}" stroke-width="3" fill="none" opacity="0.55"/>
      ${[120, 220, 320, 420, 520, 620, 720].map((x, i) => {
        const y = 480 - i * 55;
        return `<circle cx="${x}" cy="${y}" r="10" fill="${b}" opacity="0.8"/>`;
      }).join('')}`;
  } else if (asset.file === 'harvest-stories') {
    shapes = `
      <rect x="280" y="100" width="340" height="420" rx="8" fill="${a}" opacity="0.95"/>
      <line x1="330" y1="160" x2="570" y2="160" stroke="${b}" stroke-width="2" opacity="0.5"/>
      <line x1="330" y1="210" x2="520" y2="210" stroke="${b}" stroke-width="2" opacity="0.35"/>
      <line x1="330" y1="260" x2="550" y2="260" stroke="${b}" stroke-width="2" opacity="0.35"/>`;
  } else if (asset.file === 'apprenticeship') {
    shapes = `
      <rect x="160" y="360" width="580" height="24" rx="4" fill="${c}" opacity="0.35"/>
      <rect x="220" y="280" width="18" height="80" fill="${b}" opacity="0.6"/>
      <rect x="420" y="250" width="120" height="14" rx="3" fill="${b}" opacity="0.5"/>
      <circle cx="480" cy="257" r="22" fill="none" stroke="${c}" stroke-width="3" opacity="0.45"/>`;
  } else if (asset.file.startsWith('path-')) {
    shapes = `<circle cx="${w / 2}" cy="${h / 2}" r="${isSquare ? 120 : 140}" fill="${b}" opacity="0.25"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${isSquare ? 70 : 80}" fill="${a}" opacity="0.9"/>`;
  } else {
    shapes = `
      <rect x="120" y="140" width="320" height="220" fill="${a}" opacity="0.85" transform="rotate(-6 280 250)"/>
      <rect x="360" y="180" width="320" height="220" fill="${b}" opacity="0.75" transform="rotate(4 520 290)"/>
      <rect x="240" y="120" width="280" height="200" fill="${c}" opacity="0.55" transform="rotate(-2 380 220)"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${shapes}
</svg>`;
}

async function generateWithMinimax(asset) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.minimax.io/v1/image_generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'image-01',
      prompt: asset.prompt,
      aspect_ratio: asset.aspect_ratio,
      n: 1,
      response_format: 'base64',
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.base_resp?.status_msg ?? payload?.message ?? response.statusText);
  }

  const base64List = payload?.data?.image_base64;
  if (!Array.isArray(base64List) || !base64List[0]) {
    throw new Error(`No image data for ${asset.file}`);
  }

  return Buffer.from(base64List[0], 'base64');
}

async function writeAsset(asset) {
  let buffer = null;
  let ext = asset.ext;
  let source = 'minimax';

  try {
    buffer = await generateWithMinimax(asset);
  } catch (error) {
    console.warn(`MiniMax failed for ${asset.file}: ${error.message}`);
  }

  if (!buffer) {
    source = 'svg-fallback';
    ext = 'svg';
    buffer = Buffer.from(svgFallback(asset), 'utf8');
  }

  for (const dir of outDirs) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${asset.file}.${ext}`), buffer);
  }

  return { file: asset.file, ext, source };
}

async function main() {
  for (const dir of outDirs) fs.mkdirSync(dir, { recursive: true });

  const results = [];
  for (const asset of ASSETS) {
    process.stdout.write(`Generating ${asset.file}… `);
    const result = await writeAsset(asset);
    results.push(result);
    console.log(`${result.source} → .${result.ext}`);
  }

  console.log('\nDone. Files written to:');
  for (const dir of outDirs) console.log(`  ${path.relative(repoRoot, dir)}/`);
  console.log('\nUpdate data/curated/*.json image paths to match extensions above.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

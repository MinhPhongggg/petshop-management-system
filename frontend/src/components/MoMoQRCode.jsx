import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Realistic animated MoMo QR Code component.
 * Generates a 25x25 QR-like grid with proper structure that refreshes periodically.
 */
const MoMoQRCode = ({ size = 200, seed = '', refreshInterval = 30 }) => {
  const [tick, setTick] = useState(0);
  const [fading, setFading] = useState(false);

  // Refresh QR every `refreshInterval` seconds
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setTick(t => t + 1);
        setFading(false);
      }, 300);
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  // Simple seeded PRNG (mulberry32)
  const prng = useCallback((s) => {
    let h = 0;
    const str = `${s}_${tick}_momo`;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return () => {
      h |= 0; h = h + 0x6D2B79F5 | 0;
      let t = Math.imul(h ^ h >>> 15, 1 | h);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }, [tick]);

  const grid = useMemo(() => {
    const N = 25; // 25x25 modules (QR Version 2)
    const rand = prng(seed);
    const cells = Array.from({ length: N }, () => Array(N).fill(false));

    // Finder patterns (7x7) at three corners
    const drawFinder = (r, c) => {
      for (let dr = 0; dr < 7; dr++) {
        for (let dc = 0; dc < 7; dc++) {
          const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          cells[r + dr][c + dc] = isOuter || isInner;
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    // Separator (white border around finders) - already false by default

    // Timing patterns (row 6, col 6)
    for (let i = 8; i < N - 8; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    // Alignment pattern (5x5) at position (18, 18) for Version 2
    const ax = 18, ay = 18;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
        const isCenter = dr === 0 && dc === 0;
        cells[ay + dr][ax + dc] = isEdge || isCenter;
      }
    }

    // Format info bits around finders
    for (let i = 0; i < 8; i++) {
      if (i !== 6) {
        cells[8][i] = rand() > 0.5;
        cells[i][8] = rand() > 0.5;
      }
      cells[8][N - 1 - i] = rand() > 0.5;
      cells[N - 1 - i][8] = rand() > 0.5;
    }
    cells[8][8] = rand() > 0.5;
    // Dark module
    cells[N - 8][8] = true;

    // Data modules - fill remaining cells with random data
    const isReserved = (r, c) => {
      // Finder + separator zones
      if (r < 9 && c < 9) return true;
      if (r < 9 && c >= N - 8) return true;
      if (r >= N - 8 && c < 9) return true;
      // Timing
      if (r === 6 || c === 6) return true;
      // Alignment
      if (r >= ay - 2 && r <= ay + 2 && c >= ax - 2 && c <= ax + 2) return true;
      // Center logo zone (5x5 in the middle)
      const mid = Math.floor(N / 2);
      if (r >= mid - 3 && r <= mid + 3 && c >= mid - 3 && c <= mid + 3) return true;
      return false;
    };

    // Fill data with ~45% density for realistic look
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!isReserved(r, c)) {
          cells[r][c] = rand() < 0.45;
        }
      }
    }

    // Add some structured patterns near edges for realism
    for (let r = 9; r < N - 8; r++) {
      if (r !== 6) {
        if (rand() > 0.6) cells[r][7] = true;
        if (rand() > 0.6) cells[r][N - 8] = true;
      }
    }
    for (let c = 9; c < N - 8; c++) {
      if (c !== 6) {
        if (rand() > 0.6) cells[7][c] = true;
        if (rand() > 0.6) cells[N - 8][c] = true;
      }
    }

    return cells;
  }, [seed, tick, prng]);

  const N = 25;
  const padding = 8;
  const moduleSize = (size - padding * 2) / N;
  const viewBox = `0 0 ${size} ${size}`;
  const mid = Math.floor(N / 2);
  const logoR = moduleSize * 2.8;

  return (
    <div
      className="inline-block relative"
      style={{
        transition: 'opacity 0.3s ease',
        opacity: fading ? 0.3 : 1,
      }}
    >
      <svg width={size} height={size} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
        {/* White background */}
        <rect width={size} height={size} fill="white" rx="4" />

        {/* QR modules */}
        {grid.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={padding + c * moduleSize}
                y={padding + r * moduleSize}
                width={moduleSize + 0.5}
                height={moduleSize + 0.5}
                fill="#1a1a1a"
              />
            ) : null
          )
        )}

        {/* White circle behind logo */}
        <circle
          cx={padding + mid * moduleSize + moduleSize / 2}
          cy={padding + mid * moduleSize + moduleSize / 2}
          r={logoR + 3}
          fill="white"
        />

        {/* MoMo logo circle */}
        <circle
          cx={padding + mid * moduleSize + moduleSize / 2}
          cy={padding + mid * moduleSize + moduleSize / 2}
          r={logoR}
          fill="#ae2070"
        />

        {/* MoMo "M" text */}
        <text
          x={padding + mid * moduleSize + moduleSize / 2}
          y={padding + mid * moduleSize + moduleSize / 2 + logoR * 0.38}
          textAnchor="middle"
          fill="white"
          fontSize={logoR * 1.1}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          M
        </text>

        {/* Quiet zone scanlines for realism */}
        <rect x={0} y={0} width={size} height={padding - 1} fill="white" />
        <rect x={0} y={size - padding + 1} width={size} height={padding - 1} fill="white" />
        <rect x={0} y={0} width={padding - 1} height={size} fill="white" />
        <rect x={size - padding + 1} y={0} width={padding - 1} height={size} fill="white" />
      </svg>

      {/* Refresh indicator */}
      {refreshInterval > 0 && (
        <RefreshCountdown key={tick} duration={refreshInterval} />
      )}
    </div>
  );
};

/** Small circular countdown ring shown at bottom-right */
const RefreshCountdown = ({ duration }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.min((Date.now() - start) / 1000, duration));
    }, 100);
    return () => clearInterval(timer);
  }, [duration]);

  const r = 7;
  const circumference = 2 * Math.PI * r;
  const progress = elapsed / duration;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="absolute bottom-1 right-1" title="QR tự động làm mới">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2" />
        <circle
          cx="10" cy="10" r={r}
          fill="none" stroke="#ae2070" strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 10 10)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
    </div>
  );
};

export default MoMoQRCode;

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { formatPrice } from '@/lib/formatters';

// Build OHLC candles from a flat array of { time, price } ticks
// bucketMs = candle duration in ms (default 10s)
export function buildCandles(ticks, bucketMs = 10_000) {
  if (!ticks || ticks.length === 0) return [];
  const map = new Map();
  for (const { time, price } of ticks) {
    const bucket = Math.floor(time / bucketMs) * bucketMs;
    if (!map.has(bucket)) {
      map.set(bucket, { time: bucket, open: price, high: price, low: price, close: price });
    } else {
      const c = map.get(bucket);
      c.high = Math.max(c.high, price);
      c.low = Math.min(c.low, price);
      c.close = price;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}

// Custom candle bar shape
const CandleBar = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? 'hsl(142 100% 50%)' : 'hsl(0 84% 60%)';

  // The recharts Bar maps "value" to the bar dimensions.
  // We use a custom shape to draw wicks + body manually.
  // x, y, width, height come from the bar value range.
  // We re-derive from payload for precision.
  // (yScale is not directly available, so we use parent props)
  return (
    <g>
      {/* This bar is invisible — actual drawing happens via CandleShape */}
    </g>
  );
};

// Full custom renderer using SVG directly — avoids recharts candle limitations
const CustomCandleChart = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Collecting candle data...
      </div>
    );
  }

  const PADDING = { top: 16, right: 64, bottom: 24, left: 8 };

  const allPrices = data.flatMap(({ high, low }) => [high, low]);
  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);
  const priceRange = priceMax - priceMin || priceMin * 0.01;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={PADDING}>
        <XAxis dataKey="time" hide />
        <YAxis
          domain={[priceMin * 0.998, priceMax * 1.002]}
          tick={{ fill: 'hsl(0 0% 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => `$${formatPrice(v)}`}
          orientation="right"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(0 0% 6%)',
            border: '1px solid hsl(0 0% 12%)',
            borderRadius: 4,
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
          }}
          labelFormatter={() => ''}
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const c = payload[0].payload;
            const isUp = c.close >= c.open;
            const color = isUp ? 'hsl(142 100% 50%)' : 'hsl(0 84% 60%)';
            return (
              <div style={{ background: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 15%)', padding: '6px 10px', borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                <div style={{ color }}>O: ${formatPrice(c.open)} H: ${formatPrice(c.high)}</div>
                <div style={{ color }}>L: ${formatPrice(c.low)} C: ${formatPrice(c.close)}</div>
              </div>
            );
          }}
        />
        {/* Invisible bar just to register each candle in chart layout */}
        <Bar dataKey="high" isAnimationActive={false} shape={<CandleShape />}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.close >= entry.open ? 'hsl(142 100% 50%)' : 'hsl(0 84% 60%)'} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Shape component that has access to the full layout context from recharts
const CandleShape = (props) => {
  const { x, y, width, height, payload, yAxis } = props;
  if (!payload || !yAxis) return null;

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? 'hsl(142 100% 50%)' : 'hsl(0 84% 60%)';

  // recharts provides yAxis.scale — use it to map prices to SVG y
  const scale = yAxis.scale;
  if (!scale) return null;

  const yHigh = scale(high);
  const yLow = scale(low);
  const yOpen = scale(open);
  const yClose = scale(close);

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
  const candleWidth = Math.max(width * 0.6, 2);
  const cx = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect
        x={cx - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isUp ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default function CandleChart({ ticks, bucketMs = 10_000 }) {
  const candles = useMemo(() => buildCandles(ticks, bucketMs), [ticks, bucketMs]);
  return <CustomCandleChart data={candles} />;
}
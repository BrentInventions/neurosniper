import React from 'react';
import { LineChart, Line, YAxis, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPrice } from '@/lib/formatters';

export default function PriceChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Collecting chart data...
      </div>
    );
  }

  const first = data[0].price;
  const last = data[data.length - 1].price;
  const isUp = last >= first;
  const color = isUp ? 'hsl(142 100% 50%)' : 'hsl(0 84% 60%)';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis
          domain={['dataMin', 'dataMax']}
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
          formatter={(v) => [`$${formatPrice(v)}`, 'Price']}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
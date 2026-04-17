import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TokenFeed from '@/components/terminal/TokenFeed';
import TokenDetail from '@/components/terminal/TokenDetail';
import WalletCard from '@/components/terminal/WalletCard';
import { generateMockToken, tickToken, generateActivity, generateChartPoint } from '@/lib/mockFeed';

const MAX_TOKENS = 40;
const MAX_CHART_POINTS = 60;
const MAX_ACTIVITIES = 30;

export default function Terminal() {
  const [tokens, setTokens] = useState(() => Array.from({ length: 12 }, generateMockToken));
  const [selectedId, setSelectedId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [strategy, setStrategy] = useState(null);
  const [wallet] = useState({
    address: '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5',
    balance: 12.847,
    pnl24h: 18.4,
  });

  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // Load strategy
  useEffect(() => {
    (async () => {
      const list = await base44.entities.Strategy.list('-created_date', 1);
      if (list.length > 0) setStrategy(list[0]);
    })();
  }, []);

  // Spawn new tokens periodically
  useEffect(() => {
    const t = setInterval(() => {
      setTokens((prev) => [generateMockToken(), ...prev].slice(0, MAX_TOKENS));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Tick prices on all tokens
  useEffect(() => {
    const t = setInterval(() => {
      setTokens((prev) => prev.map(tickToken));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Feed chart + activities for selected
  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(() => {
      const current = tokens.find((x) => x.id === selectedIdRef.current);
      if (!current) return;
      setChartData((prev) => {
        const last = prev[prev.length - 1]?.price || current.price;
        const point = generateChartPoint(last);
        return [...prev, point].slice(-MAX_CHART_POINTS);
      });
      if (Math.random() < 0.7) {
        setActivities((prev) => [generateActivity(current), ...prev].slice(0, MAX_ACTIVITIES));
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleSelect = (token) => {
    setSelectedId(token.id);
    // Seed chart with a few points
    const seed = [];
    let p = token.price;
    for (let i = 0; i < 20; i++) {
      p = p * (1 + (Math.random() - 0.48) * 0.1);
      seed.push({ time: Date.now() - (20 - i) * 1000, price: p });
    }
    setChartData(seed);
    setActivities([]);
  };

  const selected = tokens.find((t) => t.id === selectedId);
  const positionsCount = 3;

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top: wallet summary */}
      <div className="p-4 pb-0">
        <WalletCard
          address={wallet.address}
          balance={wallet.balance}
          pnl24h={wallet.pnl24h}
          positionsCount={positionsCount}
        />
      </div>

      {/* Main workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 p-4 min-h-0">
        {/* Feed */}
        <div className="bg-card border border-border rounded-lg overflow-hidden min-h-[500px] lg:min-h-0 flex flex-col">
          <TokenFeed tokens={tokens} selectedId={selectedId} onSelect={handleSelect} />
        </div>

        {/* Detail */}
        <div className="bg-card border border-border rounded-lg overflow-hidden min-h-[600px] lg:min-h-0">
          <TokenDetail
            token={selected}
            chartData={chartData}
            activities={activities}
            strategy={strategy}
          />
        </div>
      </div>
    </div>
  );
}
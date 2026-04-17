import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TokenFeed from '@/components/terminal/TokenFeed';
import TokenDetail from '@/components/terminal/TokenDetail';
import WalletCard from '@/components/terminal/WalletCard';
import { tickToken, generateActivity, generateChartPoint } from '@/lib/mockFeed';

const MAX_TOKENS = 40;
const MAX_CHART_POINTS = 60;
const MAX_ACTIVITIES = 30;
const WS_URL = 'wss://pumpportal.fun/api/data';

// Map PumpPortal new-token event → our Token schema
const mapToken = (ev) => {
  const vSol = ev.vSolInBondingCurve || 30;
  const vTokens = ev.vTokensInBondingCurve || 1_000_000_000;
  const price = vSol / vTokens;
  const marketCapSol = ev.marketCapSol || 0;
  // approximate USD: assume 1 SOL ≈ $150 for display (no price oracle needed)
  const solToUsd = 150;
  return {
    id: ev.mint || ev.signature,
    name: ev.name || 'Unknown',
    symbol: ev.symbol || '???',
    mint_address: ev.mint || '',
    price,
    market_cap: marketCapSol * solToUsd,
    volume_24h: (ev.solAmount || 0) * solToUsd,
    liquidity: vSol * solToUsd,
    holders: 1,
    bonding_curve_progress: Math.min(100, (vSol / 85) * 100), // 85 SOL = graduation
    launched_at: new Date().toISOString(),
    is_trending: false,
    price_change_5m: 0,
    _vSol: vSol,
    _vTokens: vTokens,
    image_url: ev.uri || null,
  };
};

// Map PumpPortal trade event → activity entry
const mapActivity = (ev) => ({
  id: ev.signature,
  type: ev.txType === 'buy' ? 'buy' : 'sell',
  amount_sol: ev.solAmount || 0,
  price: ev.vSolInBondingCurve / ev.vTokensInBondingCurve || 0,
  wallet: ev.traderPublicKey || '',
  timestamp: new Date().toISOString(),
});

export default function Terminal() {
  const [tokens, setTokens] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting'); // connecting | live | error
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
  const wsRef = useRef(null);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // Load strategy
  useEffect(() => {
    (async () => {
      const list = await base44.entities.Strategy.list('-created_date', 1);
      if (list.length > 0) setStrategy(list[0]);
    })();
  }, []);

  // PumpPortal WebSocket — real-time new tokens
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      setWsStatus('connecting');
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('live');
        ws.send(JSON.stringify({ method: 'subscribeNewToken' }));
      };

      ws.onmessage = (e) => {
        const ev = JSON.parse(e.data);
        if (!ev.mint) return; // skip ack/ping frames

        if (ev.txType === 'create' || !ev.txType) {
          // New token creation event
          const token = mapToken(ev);
          setTokens((prev) => [token, ...prev].slice(0, MAX_TOKENS));
        } else if (ev.txType === 'buy' || ev.txType === 'sell') {
          // Trade on a watched token — update price, market cap, liquidity, volume
          const newPrice = ev.vSolInBondingCurve / ev.vTokensInBondingCurve;
          const solToUsd = 150;
          const tradeSolUsd = (ev.solAmount || 0) * solToUsd;
          setTokens((prev) =>
            prev.map((t) =>
              t.mint_address === ev.mint
                ? {
                    ...t,
                    price: newPrice,
                    market_cap: (ev.marketCapSol || 0) * solToUsd,
                    liquidity: ev.vSolInBondingCurve * solToUsd,
                    volume_24h: (t.volume_24h || 0) + tradeSolUsd,
                    _prevPrice: t.price,
                    bonding_curve_progress: Math.min(100, (ev.vSolInBondingCurve / 85) * 100),
                    price_change_5m: newPrice > t.price
                      ? ((newPrice - t.price) / t.price) * 100
                      : t.price_change_5m,
                  }
                : t
            )
          );
          if (ev.mint === selectedIdRef.current) {
            const activity = mapActivity(ev);
            setActivities((prev) => [activity, ...prev].slice(0, MAX_ACTIVITIES));
            setChartData((prev) =>
              [...prev, { time: Date.now(), price: newPrice }].slice(-MAX_CHART_POINTS)
            );
          }
        }
      };

      ws.onerror = () => setWsStatus('error');

      ws.onclose = () => {
        setWsStatus('error');
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  // When a token is selected, subscribe to its trades
  useEffect(() => {
    if (!selectedId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [selectedId] }));
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ method: 'unsubscribeTokenTrade', keys: [selectedId] }));
      }
    };
  }, [selectedId]);

  const handleSelect = (token) => {
    setSelectedId(token.mint_address);
    setChartData([{ time: Date.now(), price: token.price }]);
    setActivities([]);
  };

  const selected = tokens.find((t) => t.mint_address === selectedId);
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
          wsStatus={wsStatus}
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
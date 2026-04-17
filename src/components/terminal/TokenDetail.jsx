import React from 'react';
import { ExternalLink, Copy, Flame } from 'lucide-react';
import { toast } from 'sonner';
import PriceChart from './PriceChart';
import ActivityFeed from './ActivityFeed';
import TradePanel from './TradePanel';
import PriceFlash from './PriceFlash';
import { formatUSD, formatPrice, formatPercent, formatAddress, formatNumber, timeAgo } from '@/lib/formatters';

const Stat = ({ label, children }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-mono text-sm mt-0.5">{children}</div>
  </div>
);

export default function TokenDetail({ token, chartData, activities, strategy }) {
  if (!token) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Flame className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">Select a token</div>
        <div className="text-xs mt-1">Click any token in the live feed to view details</div>
      </div>
    );
  }

  const change = token.price_change_5m || 0;
  const isUp = change >= 0;

  const copyAddr = () => {
    navigator.clipboard.writeText(token.mint_address);
    toast.success('Address copied');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-border flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-primary">{token.symbol?.slice(0, 2)}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold truncate">{token.name}</h2>
                {token.is_trending && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                    TRENDING
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-muted-foreground">{token.symbol}</span>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={copyAddr}
                  className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  {formatAddress(token.mint_address, 5)}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="font-mono text-xl font-bold">
              <PriceFlash value={token.price}>${formatPrice(token.price)}</PriceFlash>
            </div>
            <div className={`text-sm font-mono font-semibold ${isUp ? 'text-primary' : 'text-destructive'}`}>
              {formatPercent(change)} 5m
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/60">
          <Stat label="Market Cap">
            <PriceFlash value={token.market_cap}>{formatUSD(token.market_cap)}</PriceFlash>
          </Stat>
          <Stat label="Volume">{formatUSD(token.volume_24h)}</Stat>
          <Stat label="Liquidity">{formatUSD(token.liquidity)}</Stat>
          <Stat label="Holders">{formatNumber(token.holders, 0)}</Stat>
        </div>

        {/* Bonding curve */}
        {token.bonding_curve_progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              <span>Bonding Curve</span>
              <span className="font-mono text-primary">{token.bonding_curve_progress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                style={{ width: `${Math.min(100, token.bonding_curve_progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-2 mt-4">
          <a
            href={`https://pump.fun/${token.mint_address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 h-7 rounded text-xs bg-secondary border border-border hover:border-primary/50 hover:text-primary transition-colors"
          >
            Pump.fun <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`https://dexscreener.com/solana/${token.mint_address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 h-7 rounded text-xs bg-secondary border border-border hover:border-primary/50 hover:text-primary transition-colors"
          >
            Dexscreener <ExternalLink className="w-3 h-3" />
          </a>
          <span className="ml-auto text-xs font-mono text-muted-foreground">
            Launched {timeAgo(token.launched_at)} ago
          </span>
        </div>
      </div>

      {/* Body: Chart + Activity + Trade */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden min-h-0">
        {/* Chart */}
        <div className="lg:col-span-2 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-0">
          <div className="flex items-center justify-between px-4 h-9 border-b border-border/60 bg-card/30">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Price Chart</span>
            <span className="text-[10px] font-mono text-muted-foreground">{chartData?.length || 0} pts</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <PriceChart data={chartData} />
          </div>
          <div className="border-t border-border/60 h-48 flex flex-col">
            <div className="flex items-center px-4 h-9 border-b border-border/60 bg-card/30">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Live Activity</span>
            </div>
            <div className="flex-1 min-h-0">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>

        {/* Trade panel */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center px-4 h-9 border-b border-border/60 bg-card/30">
            <span className="text-xs font-mono uppercase tracking-wider text-primary">Trade Panel</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TradePanel token={token} strategy={strategy} />
          </div>
        </div>
      </div>
    </div>
  );
}
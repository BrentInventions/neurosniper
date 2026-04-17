import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { tradingApi } from '@/lib/tradingApi';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { formatSOL, formatPrice, formatPercent, formatAddress, timeAgo } from '@/lib/formatters';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const p = await base44.entities.Position.filter({ status: 'open' }, '-opened_at');
    setPositions(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const closePosition = async (position) => {
    try {
      await tradingApi.sell({
        mint_address: position.mint_address,
        amount_sol: position.amount_sol + (position.pnl_sol || 0),
        token_symbol: position.token_symbol,
        price: position.current_price,
        pnl_sol: position.pnl_sol || 0,
      });
      await base44.entities.Position.update(position.id, {
        status: 'closed',
        closed_at: new Date().toISOString(),
      });
      toast.success(`Closed ${position.token_symbol}`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const totalPnl = positions.reduce((s, p) => s + (p.pnl_sol || 0), 0);
  const totalInvested = positions.reduce((s, p) => s + (p.amount_sol || 0), 0);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Positions</div>
          <div className="font-mono text-2xl font-semibold mt-1">{positions.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Invested</div>
          <div className="font-mono text-2xl font-semibold mt-1">{formatSOL(totalInvested)} <span className="text-sm text-muted-foreground">SOL</span></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Unrealized PnL</div>
          <div className={`font-mono text-2xl font-semibold mt-1 flex items-center gap-1.5 ${totalPnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {totalPnl >= 0 ? '+' : ''}{formatSOL(totalPnl)} <span className="text-sm opacity-70">SOL</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center px-4 h-11 border-b border-border">
          <Wallet className="w-4 h-4 text-primary mr-2" />
          <span className="font-mono text-sm font-semibold">ACTIVE POSITIONS</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading positions...</div>
        ) : positions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm">No open positions</div>
            <div className="text-xs text-muted-foreground mt-1">Execute a buy from the terminal to open one</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="text-left px-4 py-2 font-medium">Token</th>
                  <th className="text-right px-4 py-2 font-medium">Entry</th>
                  <th className="text-right px-4 py-2 font-medium">Current</th>
                  <th className="text-right px-4 py-2 font-medium">Size</th>
                  <th className="text-right px-4 py-2 font-medium">PnL</th>
                  <th className="text-right px-4 py-2 font-medium">Age</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const isUp = (p.pnl_percent || 0) >= 0;
                  return (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.token_symbol}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{formatAddress(p.mint_address, 4)}</div>
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-xs">${formatPrice(p.entry_price)}</td>
                      <td className="text-right px-4 py-3 font-mono text-xs">${formatPrice(p.current_price)}</td>
                      <td className="text-right px-4 py-3 font-mono">{formatSOL(p.amount_sol)} SOL</td>
                      <td className={`text-right px-4 py-3 font-mono font-semibold ${isUp ? 'text-primary' : 'text-destructive'}`}>
                        <div>{isUp ? '+' : ''}{formatSOL(p.pnl_sol)}</div>
                        <div className="text-[10px]">{formatPercent(p.pnl_percent)}</div>
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-xs text-muted-foreground">{timeAgo(p.opened_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closePosition(p)}
                          className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-3 h-3 mr-1" /> Close
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
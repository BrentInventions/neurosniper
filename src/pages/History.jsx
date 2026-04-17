import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, XCircle, Clock, History as HistoryIcon } from 'lucide-react';
import { formatSOL, formatPrice, formatAddress, timeAgo } from '@/lib/formatters';

export default function History() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await base44.entities.Trade.list('-executed_at', 100);
      setTrades(t);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center px-4 h-11 border-b border-border">
          <HistoryIcon className="w-4 h-4 text-primary mr-2" />
          <span className="font-mono text-sm font-semibold">TRADE HISTORY</span>
          <span className="ml-2 text-xs font-mono text-muted-foreground">({trades.length})</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm">No trades yet</div>
            <div className="text-xs text-muted-foreground mt-1">Executed trades will appear here</div>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {trades.map((t) => {
              const isBuy = t.type === 'buy';
              const StatusIcon = t.status === 'success' ? CheckCircle2 : t.status === 'failed' ? XCircle : Clock;
              return (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                      isBuy ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {isBuy ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold uppercase ${isBuy ? 'text-primary' : 'text-destructive'}`}>
                        {t.type}
                      </span>
                      <span className="font-medium text-sm">{t.token_symbol}</span>
                      <span className="text-xs font-mono text-muted-foreground">{formatAddress(t.mint_address, 4)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground mt-0.5">
                      <span>@${formatPrice(t.price)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${t.status === 'success' ? 'text-primary' : t.status === 'failed' ? 'text-destructive' : ''}`} />
                        {t.status}
                      </span>
                      {t.tx_hash && (
                        <>
                          <span>·</span>
                          <span>tx: {formatAddress(t.tx_hash, 4)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{formatSOL(t.amount_sol)} SOL</div>
                    {t.pnl_sol !== undefined && t.pnl_sol !== 0 && (
                      <div className={`text-xs font-mono ${t.pnl_sol >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        PnL {t.pnl_sol >= 0 ? '+' : ''}{formatSOL(t.pnl_sol)}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs font-mono text-muted-foreground w-12">
                    {timeAgo(t.executed_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
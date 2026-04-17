// Trading API client — routes all trade actions through the backend.
// The backend is responsible for signing transactions (private keys NEVER leave backend).
//
// Usage:
//   await tradingApi.buy({ mint_address, amount_sol });
//   await tradingApi.sell({ mint_address, percent: 100 });

import { base44 } from '@/api/base44Client';

const SIMULATE_LATENCY = 800;

const simulate = (data, failRate = 0.05) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error('Transaction failed: slippage exceeded'));
      } else {
        resolve({
          tx_hash: `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
          status: 'success',
          ...data,
        });
      }
    }, SIMULATE_LATENCY);
  });

export const tradingApi = {
  // POST /buy
  buy: async ({ mint_address, amount_sol, token_symbol, price }) => {
    // In production:
    // return (await base44.functions.invoke('buy', { mint_address, amount_sol })).data;
    const result = await simulate({ mint_address, amount_sol, price });
    await base44.entities.Trade.create({
      token_symbol,
      mint_address,
      type: 'buy',
      amount_sol,
      price,
      tokens: price ? amount_sol / price : 0,
      tx_hash: result.tx_hash,
      status: 'success',
      executed_at: new Date().toISOString(),
    });
    return result;
  },

  // POST /sell
  sell: async ({ mint_address, amount_sol, token_symbol, price, pnl_sol = 0 }) => {
    // In production:
    // return (await base44.functions.invoke('sell', { mint_address, percent })).data;
    const result = await simulate({ mint_address, amount_sol, price });
    await base44.entities.Trade.create({
      token_symbol,
      mint_address,
      type: 'sell',
      amount_sol,
      price,
      tx_hash: result.tx_hash,
      status: 'success',
      pnl_sol,
      executed_at: new Date().toISOString(),
    });
    return result;
  },

  // GET /positions
  positions: async () => {
    return await base44.entities.Position.filter({ status: 'open' }, '-opened_at');
  },

  // GET /tokens/live — placeholder, real implementation uses WebSocket
  tokensLive: async () => {
    return [];
  },
};
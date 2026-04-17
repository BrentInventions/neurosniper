// Mock real-time feed simulator for Pump.fun tokens.
// In production, replace with WebSocket connection to backend.
//
// Example backend integration:
//   const ws = new WebSocket('wss://your-backend/tokens/live');
//   ws.onmessage = (e) => onTokenUpdate(JSON.parse(e.data));

const MEME_NAMES = [
  { name: 'PepeCoin AI', symbol: 'PEPAI' },
  { name: 'SolDogeX', symbol: 'SDOGX' },
  { name: 'MoonShot 3000', symbol: 'MOON3K' },
  { name: 'ChadCat', symbol: 'CHAD' },
  { name: 'Wojak Returns', symbol: 'WOJAK' },
  { name: 'BonkBonk', symbol: 'BONK2' },
  { name: 'TurboFrog', symbol: 'TFROG' },
  { name: 'RugPullCheck', symbol: 'RPC' },
  { name: 'SnipeMaster', symbol: 'SNIPE' },
  { name: 'GigaChadSol', symbol: 'GCSOL' },
  { name: 'DegenAI', symbol: 'DGAI' },
  { name: 'RocketFuel', symbol: 'RKFL' },
  { name: 'NeuroSol', symbol: 'NSOL' },
  { name: 'LaserEyes', symbol: 'LSRE' },
  { name: 'DiamondPaws', symbol: 'DPAWS' },
];

const randAddress = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 44; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

const rand = (min, max) => min + Math.random() * (max - min);

export const generateMockToken = () => {
  const template = MEME_NAMES[Math.floor(Math.random() * MEME_NAMES.length)];
  const suffix = Math.floor(Math.random() * 9999);
  const price = rand(0.00000001, 0.00005);
  const marketCap = rand(5000, 250000);
  return {
    id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: `${template.name} ${suffix}`,
    symbol: template.symbol,
    mint_address: randAddress(),
    price,
    market_cap: marketCap,
    volume_24h: rand(1000, 80000),
    liquidity: rand(2000, 50000),
    holders: Math.floor(rand(5, 800)),
    bonding_curve_progress: rand(0, 100),
    launched_at: new Date(Date.now() - Math.floor(rand(0, 300_000))).toISOString(),
    is_trending: Math.random() < 0.15,
    price_change_5m: rand(-50, 250),
  };
};

export const tickToken = (token) => {
  const delta = rand(-0.08, 0.12);
  const newPrice = Math.max(token.price * (1 + delta), 0.000000001);
  return {
    ...token,
    price: newPrice,
    market_cap: token.market_cap * (1 + delta),
    volume_24h: token.volume_24h + rand(0, 5000),
    bonding_curve_progress: Math.min(100, (token.bonding_curve_progress || 0) + rand(-1, 3)),
    price_change_5m: (token.price_change_5m || 0) + rand(-5, 8),
    _prevPrice: token.price,
  };
};

export const generateActivity = (token) => {
  const type = Math.random() < 0.55 ? 'buy' : 'sell';
  return {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    amount_sol: rand(0.05, 5),
    price: token.price,
    wallet: randAddress().slice(0, 10),
    timestamp: new Date().toISOString(),
  };
};

export const generateChartPoint = (lastPrice) => ({
  time: Date.now(),
  price: Math.max(lastPrice * (1 + rand(-0.06, 0.08)), 0.000000001),
});
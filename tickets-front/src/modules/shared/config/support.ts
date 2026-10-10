import binanceQr from 'src/assets/support/binance-qr.png';

export interface SupportMethod {
  name: string;
  icon: string;
  url?: string;
  handle?: string;
  qr?: string;
}

const BINANCE_PAY_ID = '761259318';
const BUY_ME_A_COFFEE_URL = '';

const METHODS: SupportMethod[] = [
  {
    name: 'Binance Pay ID',
    icon: 'sym_r_currency_bitcoin',
    handle: BINANCE_PAY_ID,
    qr: binanceQr,
  },
  {
    name: 'Buy Me a Coffee',
    icon: 'sym_r_coffee',
    url: BUY_ME_A_COFFEE_URL,
  },
];

export const SUPPORT_METHODS = METHODS.filter((method) => method.url || method.handle);

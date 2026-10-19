import { createContext, useContext } from 'react';
export const CurrencyContext = createContext('Rs.');
export function useMoney() {
  const currency = useContext(CurrencyContext);
  return (amount: number) => `${currency} ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(amount)}`;
}

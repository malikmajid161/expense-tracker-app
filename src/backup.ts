import { deviceKey } from './storage';
const fields = ['transactions', 'wallets', 'budgets', 'monthlyBudget', 'currency', 'budgetAlertLimit', 'userName', 'userAvatar', 'notifications'] as const;
export function exportBackup() {
  const data = Object.fromEntries(fields.map(field => [field, localStorage.getItem(deviceKey(field))]));
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, data }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'fintrack-backup.json'; link.click(); URL.revokeObjectURL(url);
}
export function restoreBackup(text: string) {
  const backup = JSON.parse(text);
  if (backup.version !== 1 || !backup.data || typeof backup.data !== 'object') throw new Error('Choose a FinTrack backup file.');
  const parsed: Record<string, any> = {};
  for (const field of fields) {
    const value = backup.data[field];
    if (value !== null && typeof value !== 'string') throw new Error('Invalid backup data.');
    parsed[field] = value === null ? null : JSON.parse(value);
  }
  const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n);
  const strings = (value: any, keys: string[]) => value && keys.every(key => typeof value[key] === 'string');
  if (!Array.isArray(parsed.transactions) || !parsed.transactions.every((t: any) => strings(t, ['id','category','wallet','note','date']) && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && finite(t.amount) && t.amount > 0 && ['income','expense'].includes(t.type))) throw new Error('Invalid transactions in backup.');
  if (!Array.isArray(parsed.wallets) || !parsed.wallets.every((w: any) => strings(w, ['id','name','icon','color']) && finite(w.balance) && ['cash','bank','mobile'].includes(w.type))) throw new Error('Invalid wallets in backup.');
  if (!Array.isArray(parsed.budgets) || !parsed.budgets.every((b: any) => strings(b, ['id','category','icon']) && finite(b.limit) && finite(b.spent))) throw new Error('Invalid budgets in backup.');
  if (!finite(parsed.monthlyBudget) || parsed.monthlyBudget <= 0 || !finite(parsed.budgetAlertLimit) || parsed.budgetAlertLimit < 1 || parsed.budgetAlertLimit > 100 || typeof parsed.currency !== 'string' || typeof parsed.userName !== 'string' || !(parsed.userAvatar === null || typeof parsed.userAvatar === 'string') || !Array.isArray(parsed.notifications) || !parsed.notifications.every((n: any) => strings(n, ['id','title','message','time','type']) && typeof n.read === 'boolean')) throw new Error('Invalid settings in backup.');
  const before = fields.map(field => localStorage.getItem(deviceKey(field)));
  try {
    fields.forEach(field => localStorage.setItem(deviceKey(field), JSON.stringify(parsed[field])));
  } catch (error) {
    fields.forEach((field, index) => { if (before[index] !== null) localStorage.setItem(deviceKey(field), before[index]!); else localStorage.removeItem(deviceKey(field)); });
    throw error;
  }
}

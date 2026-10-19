import { Component } from 'react';
import type { ReactNode } from 'react';
export default class StorageBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="max-w-lg mx-auto p-8 space-y-4"><h1 className="text-2xl font-bold">Unable to read saved data</h1><p>Your saved data has been left untouched. Storage may be disabled, full, or damaged. Download a recovery copy before changing browser storage.</p><button className="bg-indigo-600 text-white rounded-xl p-3" onClick={() => {
      const data = Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('expense_') || k.startsWith('fintrack_')).map(k => [k, localStorage.getItem(k)]));
      const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'fintrack-recovery.json'; a.click(); URL.revokeObjectURL(url);
    }}>Download recovery copy</button></div>;
  }
}

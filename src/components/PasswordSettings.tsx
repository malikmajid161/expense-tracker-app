import { useState } from 'react';
import { changePassword, generateRecoveryCode } from '../auth';
export default function PasswordSettings() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(action: 'password' | 'recovery') {
    setMessage(''); setCode(''); setBusy(true);
    try {
      if (action === 'password') {
        if (next !== confirm) throw new Error('The new passwords do not match.');
        await changePassword(current, next); setNext(''); setConfirm(''); setMessage('Password changed.');
      } else setCode(await generateRecoveryCode(current));
      setCurrent('');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
    <h3 className="text-lg font-bold">Password & recovery</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">Change your password or generate a recovery code for forgotten passwords.</p>
    <label className="block text-sm font-medium">Current password<input autoComplete="current-password" type="password" value={current} onChange={e => setCurrent(e.target.value)} className="block mt-2 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800" /></label>
    <form onSubmit={e => { e.preventDefault(); void run('password'); }} className="space-y-4">
      <label className="block text-sm font-medium">New password<input required minLength={8} autoComplete="new-password" type="password" value={next} onChange={e => setNext(e.target.value)} className="block mt-2 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800" /></label>
      <label className="block text-sm font-medium">Confirm new password<input required autoComplete="new-password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="block mt-2 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800" /></label>
      <button disabled={busy || !current} className="w-full p-3 rounded-xl bg-indigo-600 text-white disabled:opacity-50">Change password</button>
    </form>
    <button disabled={busy || !current} onClick={() => void run('recovery')} className="w-full p-3 rounded-xl border border-indigo-300 text-indigo-600 dark:text-indigo-300 disabled:opacity-50">Generate new recovery code</button>
    {message && <p role="status" className="text-sm">{message}</p>}
    {code && <div className="space-y-3"><p className="text-sm">Save this code somewhere safe. It replaces your previous recovery code.</p><p data-testid="settings-recovery-code" className="font-mono select-all break-all rounded-xl p-4 bg-indigo-50 dark:bg-slate-800">{code}</p></div>}
  </section>;
}

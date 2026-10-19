import { useState } from 'react';
import type { FormEvent } from 'react';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { hasPassword, hasRecoveryCode, initializePassword, resetPassword, verifyPassword } from '../auth';
export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [setup] = useState(() => !hasPassword());
  const [reset, setReset] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if ((setup || reset) && password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try {
      if (setup) setNewCode(await initializePassword(password));
      else if (reset) setNewCode(await resetPassword(code, password));
      else if (!await verifyPassword(password)) setError('Incorrect password. Please try again.');
      else onUnlock();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to continue. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="absolute inset-0 z-[100] bg-slate-900 text-white overflow-y-auto flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="lock-title">
    {newCode ? <div className="w-full max-w-sm space-y-5 py-8">
      <ShieldCheck className="text-indigo-400" size={44} /><h1 id="lock-title" className="text-2xl font-bold">Save your recovery code</h1>
      <p className="text-slate-300">Keep this code somewhere safe. You’ll need it if you forget your password. A new code replaces your previous code.</p>
      <p data-testid="recovery-code" className="font-mono break-all bg-slate-800 p-4 rounded-xl select-all">{newCode}</p>
      <label className="flex items-center gap-3"><input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)} />I have saved my recovery code</label>
      <button disabled={!saved} onClick={onUnlock} className="w-full bg-indigo-500 rounded-xl p-3 font-semibold disabled:opacity-50">Continue</button>
    </div> : <form onSubmit={submit} className="w-full max-w-sm space-y-5 py-8">
      <ShieldCheck className="text-indigo-400" size={44} />
      <h1 id="lock-title" className="text-3xl font-bold">{reset ? 'Reset password' : setup ? 'Welcome to FinTrack' : 'Welcome back'}</h1>
      <p className="text-slate-300 leading-relaxed">{reset ? 'Enter your recovery code and choose a new password.' : setup ? 'Create a password to secure your finances.' : 'Enter your password to open your finances.'}</p>
      {reset && <div><label htmlFor="recovery" className="block mb-2">Recovery code</label><input id="recovery" required value={code} onChange={e => setCode(e.target.value)} autoComplete="off" className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3" />{!hasRecoveryCode() && <p className="text-sm text-amber-200 mt-2">No recovery code has been set up. If you know your password, sign in and generate one in Settings → Password & recovery.</p>}</div>}
      <div><label htmlFor="password" className="block mb-2 font-medium">{reset ? 'New password' : setup ? 'Create password' : 'Password'}</label><div className="relative">
        <input id="password" autoFocus type={visible ? 'text' : 'password'} autoComplete={setup || reset ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={setup || reset ? 8 : 1} className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 pr-14" />
        <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)} className="absolute right-1 top-0 p-3">{visible ? <EyeOff /> : <Eye />}</button>
      </div></div>
      {(setup || reset) && <div><label htmlFor="confirm" className="block mb-2 font-medium">Confirm password</label><input id="confirm" type={visible ? 'text' : 'password'} autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3" /></div>}
      {error && <p role="alert" className="text-rose-300">{error}</p>}
      <button disabled={busy} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl p-3 font-semibold disabled:opacity-60">{busy ? 'Please wait…' : reset ? 'Reset password' : setup ? 'Create password & start' : 'Unlock'}</button>
      {!setup && <button type="button" onClick={() => { setReset(!reset); setError(''); setPassword(''); setConfirm(''); }} className="w-full text-indigo-300">{reset ? 'Back to sign in' : 'Forgot password?'}</button>}
    </form>}
  </div>;
}

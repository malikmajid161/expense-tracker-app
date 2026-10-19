import { useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { APP_VERSION, RELEASES_URL } from '../version';
const ReleaseLinks = registerPlugin<{ open(options: { url: string }): Promise<void> }>('ReleaseLinks');
function newer(tag: string) {
  if (!/^v?\d+\.\d+\.\d+$/.test(tag)) return false;
  const next = tag.replace(/^v/, '').split('.').map(Number);
  const current = APP_VERSION.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if (next[i] !== current[i]) return next[i] > current[i]; }
  return false;
}
export default function AppUpdates() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [download, setDownload] = useState('');
  async function open(url: string) {
    try {
      if (Capacitor.isNativePlatform()) await ReleaseLinks.open({ url });
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch { setMessage('Could not open the download. Please try again.'); }
  }
  async function check() {
    setBusy(true); setMessage(''); setDownload('');
    try {
      const response = await fetch('https://api.github.com/repos/malikmajid161/expense-tracker-app/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Could not check for updates. Try again or open GitHub releases.');
      const release = await response.json();
      if (release.draft || release.prerelease || !newer(release.tag_name || '')) { setMessage('You’re up to date.'); return; }
      const asset = release.assets?.find((a: { name: string; browser_download_url: string }) => a.name.endsWith('.apk') && a.browser_download_url.startsWith('https://github.com/malikmajid161/expense-tracker-app/releases/download/'));
      if (!asset) throw new Error('The next version is being prepared. Please check again later.');
      setDownload(asset.browser_download_url); setMessage(`Version ${release.tag_name.replace(/^v/, '')} is available.`);
    } catch (e) { setMessage(e instanceof Error && e.name !== 'TimeoutError' ? e.message : 'Connection timed out. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
    <h3 className="text-lg font-bold">App updates</h3><p className="text-sm text-slate-500 dark:text-slate-400">Version {APP_VERSION}. Get the latest release from GitHub.</p>
    <button disabled={busy} onClick={() => void check()} className="w-full p-3 rounded-xl bg-indigo-600 text-white disabled:opacity-50">{busy ? 'Checking…' : 'Check for updates'}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
    {download && <><p className="text-sm">Download the APK, then choose Install to update. Keep the app installed to preserve your data.</p><button onClick={() => void open(download)} className="w-full p-3 rounded-xl bg-emerald-600 text-white">Download update</button></>}
    <button onClick={() => void open(RELEASES_URL)} className="w-full p-3 rounded-xl border border-indigo-300 text-indigo-600 dark:text-indigo-300">Open GitHub releases</button>
  </section>;
}

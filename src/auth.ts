const KEY = 'fintrack_password_v1';
interface Credential { salt: number[]; hash: number[]; recoverySalt?: number[]; recoveryHash?: number[] }
async function derive(password: string, salt: number[]) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return Array.from(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 210000, hash: 'SHA-256' }, key, 256)));
}
const salt = () => Array.from(crypto.getRandomValues(new Uint8Array(16)));
const read = (): Credential | null => JSON.parse(localStorage.getItem(KEY) || 'null');
const equal = (a: number[], b: number[]) => a.length === b.length && a.reduce((diff, value, i) => diff | (value ^ b[i]), 0) === 0;
const normalize = (code: string) => code.replace(/[\s-]/g, '').toUpperCase();
export function hasPassword() { return localStorage.getItem(KEY) !== null; }
export function hasRecoveryCode() { return Boolean(read()?.recoveryHash); }
export async function createPassword(password: string) {
  if (password.length < 8) throw new Error('Use at least 8 characters.');
  const credential = read();
  const passwordSalt = salt();
  localStorage.setItem(KEY, JSON.stringify({ ...credential, salt: passwordSalt, hash: await derive(password, passwordSalt) }));
}
export async function verifyPassword(password: string) {
  const credential = read();
  return credential ? equal(await derive(password, credential.salt), credential.hash) : false;
}
async function recovery(credential: Credential) {
  const code = salt().map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  const recoverySalt = salt();
  const recoveryHash = await derive(code, recoverySalt);
  return { credential: { ...credential, recoverySalt, recoveryHash }, code: code.match(/.{4}/g)!.join('-') };
}
export async function initializePassword(password: string) {
  if (hasPassword()) throw new Error('A password already exists.');
  if (password.length < 8) throw new Error('Use at least 8 characters.');
  const passwordSalt = salt();
  const result = await recovery({ salt: passwordSalt, hash: await derive(password, passwordSalt) });
  localStorage.setItem(KEY, JSON.stringify(result.credential));
  return result.code;
}
export async function changePassword(current: string, next: string) {
  if (!await verifyPassword(current)) throw new Error('Current password is incorrect.');
  await createPassword(next);
}
export async function generateRecoveryCode(current: string) {
  if (!await verifyPassword(current)) throw new Error('Current password is incorrect.');
  const result = await recovery(read()!);
  localStorage.setItem(KEY, JSON.stringify(result.credential));
  return result.code;
}
export async function resetPassword(code: string, next: string) {
  if (next.length < 8) throw new Error('Use at least 8 characters.');
  const credential = read();
  if (!credential?.recoverySalt || !credential.recoveryHash || !equal(await derive(normalize(code), credential.recoverySalt), credential.recoveryHash)) throw new Error('Recovery code is incorrect.');
  const passwordSalt = salt();
  const result = await recovery({ salt: passwordSalt, hash: await derive(next, passwordSalt) });
  localStorage.setItem(KEY, JSON.stringify(result.credential));
  return result.code;
}

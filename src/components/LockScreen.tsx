import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, User, KeyRound, Zap } from 'lucide-react';
import { supabase } from '../supabase';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

interface LockScreenProps {
  onUnlock: (email: string) => void;
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'biometric' | 'otp_verify';

export default function LockScreen({ onUnlock, twoFactorEnabled = false, biometricEnabled = false }: LockScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Biometric State
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (mode === 'biometric') {
      checkBiometric();
    }
  }, [mode]);

  const checkBiometric = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        setErrorMsg('Biometric not available on this device');
        setMode('login');
      }
    } catch (e) {
      console.warn('Biometrics not available:', e);
      setMode('login');
    }
  };

  const handleBiometricScan = async () => {
    setIsScanning(true);
    setErrorMsg('');
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Access your finances",
        title: "FinTrack Security",
        subtitle: "Authenticating...",
        description: "Please use your fingerprint to unlock",
      });

      setIsScanning(false);
      setIsSuccess(true);
      const lastUser = localStorage.getItem('expense_currentUser') || 'guest@fintrack.app';
      setTimeout(() => onUnlock(lastUser), 800);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg('Authentication failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const inputVal = username.trim();
    if (!inputVal) {
      setErrorMsg('Please enter a username');
      return;
    }
    const formattedEmail = inputVal.includes('@') ? inputVal : `${inputVal}@fintrack.app`;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: password,
      });

      if (error) {
        setErrorMsg('Login failed: ' + error.message);
      } else if (data.user) {
        localStorage.setItem('expense_currentUser', formattedEmail);
        onUnlock(formattedEmail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter a username');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    const inputVal = username.trim();
    const formattedEmail = inputVal.includes('@') ? inputVal : `${inputVal}@fintrack.app`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formattedEmail,
        password: password,
      });

      if (error) {
        setErrorMsg('Signup failed: ' + error.message);
      } else if (data.user) {
        // Unlock immediately on signup
        localStorage.setItem('expense_currentUser', formattedEmail);
        onUnlock(formattedEmail);
      }
    } catch (err: any) {
       setErrorMsg(err.message || 'An error occurred during registration');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) setErrorMsg('Google login failed: ' + error.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google login');
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-slate-900 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm px-6 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white text-center">
            {mode === 'biometric' ? 'Device Locked' :
             mode === 'login' ? 'Welcome Back' : 
             mode === 'register' ? 'Create Account' : 
             mode === 'otp_verify' ? 'Verify OTP' :
             'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm mt-1 text-center min-h-8 px-2">
            {errorMsg ? (
              <span className="text-rose-400 font-bold">{errorMsg}</span>
            ) : mode === 'biometric' ? 'Use biometric to continue' :
             mode === 'login' ? 'Sign in to access your finances' : 
             mode === 'register' ? 'Create account & instant unlock' : 
             'Enter code sent to your email'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'biometric' && (
            <motion.div
              key="biometric"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <button
                onClick={handleBiometricScan}
                disabled={isScanning || isSuccess}
                className="relative group flex flex-col items-center focus:outline-none"
              >
                <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isSuccess ? 'border-emerald-500 bg-emerald-500/20' : 
                  isScanning ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 
                  'border-slate-600 bg-slate-800 hover:border-indigo-400'
                }`}>
                  {isSuccess ? (
                    <ShieldCheck size={48} className="text-emerald-500" />
                  ) : (
                    <Fingerprint size={48} className={`transition-colors ${isScanning ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                  )}
                </div>
                <p className="mt-6 font-bold text-slate-400">
                  {isSuccess ? 'Verified' : isScanning ? 'Authenticating...' : 'Tap to use Fingerprint'}
                </p>
              </button>

              <button 
                onClick={() => setMode('login')}
                className="mt-8 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Use Password Instead
              </button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin}
              className="space-y-3.5"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" required placeholder="Username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} required placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                Sign In
              </button>
              
              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setMode('biometric')} className="text-xs font-bold text-slate-400 hover:text-white flex items-center">
                  <Fingerprint size={16} className="mr-1.5" /> Biometric
                </button>
                <button type="button" onClick={() => setMode('register')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                  Create Account
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-3.5"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" required placeholder="Username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="password" required placeholder="New Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="password" required placeholder="Confirm Password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                Create Account & Unlock
              </button>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-slate-400 mt-2 hover:text-white">
                Already have an account? Sign In
              </button>
            </motion.form>
          )}

          {mode === 'otp_verify' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={(e) => {
                e.preventDefault();
                onUnlock(username || 'user@fintrack.app');
              }}
              className="space-y-4"
            >
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text" required placeholder="6-digit code"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 text-center tracking-[1em] font-bold"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                Verify & Unlock
              </button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-sm font-bold text-slate-400 mt-2">
                Back to Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

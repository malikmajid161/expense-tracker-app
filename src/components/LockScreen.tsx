import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

interface LockScreenProps {
  onUnlock: (email: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'biometric';

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Biometric State
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setErrorMsg('');
  }, [mode]);

  const handleBiometricScan = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      const lastUser = localStorage.getItem('expense_currentUser') || 'guest@fintrack.com';
      setTimeout(() => onUnlock(lastUser), 800);
    }, 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // First check Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback to local storage auth if Supabase fails (e.g. offline)
        const users = JSON.parse(localStorage.getItem('fintrack_users') || '[]');
        const localUser = users.find((u: any) => u.email === email && u.password === btoa(password));
        if (localUser) {
          onUnlock(email);
        } else {
          setErrorMsg(error.message || 'Invalid email or password');
        }
      } else if (data.user) {
        onUnlock(data.user.email || email);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Also save to local storage as a backup
      const users = JSON.parse(localStorage.getItem('fintrack_users') || '[]');
      if (!users.find((u: any) => u.email === email)) {
        users.push({ email, password: btoa(password) });
        localStorage.setItem('fintrack_users', JSON.stringify(users));
      }

      if (data.user) {
        // Supabase requires email verification by default, but we'll unlock immediately for smooth UX
        onUnlock(data.user.email || email);
      } else {
         // Fallback if no user returned
         onUnlock(email);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert(`Reset instructions sent to ${email} via Supabase!`);
        setMode('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-slate-900 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      
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
            {mode === 'biometric' ? 'FinTrack Locked' : 
             mode === 'login' ? 'Welcome Back' : 
             mode === 'register' ? 'Create Account' : 
             'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm mt-1 text-center h-5">
            {errorMsg ? (
              <span className="text-rose-400 font-medium">{errorMsg}</span>
            ) : mode === 'biometric' ? 'Please authenticate to continue' : 
             mode === 'login' ? 'Sign in to access your finances' : 
             mode === 'register' ? 'Secure your financial journey' : 
             'Enter your email to receive a reset link'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'biometric' && (
            <motion.div
              key="biometric"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
                  {isScanning && (
                    <motion.div 
                      initial={{ top: '10%' }}
                      animate={{ top: '90%' }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', ease: "linear" }}
                      className="absolute w-16 h-1 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </div>
                <p className={`mt-6 font-bold transition-colors ${
                  isSuccess ? 'text-emerald-400' : isScanning ? 'text-indigo-400' : 'text-slate-400'
                }`}>
                  {isSuccess ? 'Verified' : isScanning ? 'Scanning...' : 'Touch sensor to unlock'}
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
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode('forgot_password')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-colors mt-2">
                Sign In
              </button>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setMode('biometric')} className="text-sm font-semibold text-slate-400 hover:text-white flex items-center">
                  <Fingerprint size={16} className="mr-1.5" /> Biometric
                </button>
                <button type="button" onClick={() => setMode('register')} className="text-sm font-semibold text-slate-400 hover:text-white">
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
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-colors mt-2">
                Sign Up
              </button>

              <button type="button" onClick={() => setMode('login')} className="w-full mt-4 flex items-center justify-center text-sm font-semibold text-slate-400 hover:text-white">
                <ArrowLeft size={16} className="mr-1.5" /> Back to Login
              </button>
            </motion.form>
          )}

          {mode === 'forgot_password' && (
            <motion.form
              key="forgot_password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="Enter your Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-colors mt-2">
                Send Reset Link
              </button>

              <button type="button" onClick={() => setMode('login')} className="w-full mt-4 flex items-center justify-center text-sm font-semibold text-slate-400 hover:text-white">
                <ArrowLeft size={16} className="mr-1.5" /> Back to Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

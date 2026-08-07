import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Camera, User, Mail, Phone } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
}

export default function EditProfileModal({ 
  isOpen, onClose, userName, setUserName, userEmail, setUserEmail, userAvatar, setUserAvatar 
}: EditProfileModalProps) {
  
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName(userName);
      setEmail(userEmail);
    }
  }, [isOpen, userName, userEmail]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(name || 'User');
    setUserEmail(email);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] rounded-b-[3rem] md:rounded-[2.5rem]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 h-[85%] bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-[90] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Profile</h3>
              <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar Upload */}
                <div className="flex flex-col items-center justify-center pt-4 pb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl overflow-hidden border-4 border-white dark:border-slate-900">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2.5 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-colors border-2 border-white dark:border-slate-900"
                    >
                      <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-4">Tap to change photo</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                form="edit-profile-form"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all active:scale-95"
              >
                <Check size={20} className="mr-2" /> Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

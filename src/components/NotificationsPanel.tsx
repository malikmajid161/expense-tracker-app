import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, AlertCircle, TrendingUp, Info } from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export default function NotificationsPanel({ isOpen, onClose, notifications, setNotifications }: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle size={20} className="text-rose-500" />;
      case 'success': return <TrendingUp size={20} className="text-emerald-500" />;
      default: return <Info size={20} className="text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] rounded-b-[3rem] md:rounded-[2.5rem]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 h-[80%] bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-[90] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors tooltip relative group">
                    <CheckCheck size={20} />
                  </button>
                )}
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Bell size={48} className="opacity-20" />
                  <p className="font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      notif.read 
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' 
                        : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5'
                    }`}
                  >
                    <div className="flex space-x-4">
                      <div className={`mt-1 p-2 rounded-xl h-fit ${
                        notif.type === 'alert' ? 'bg-rose-50 dark:bg-rose-900/30' : 
                        notif.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 
                        'bg-indigo-50 dark:bg-indigo-900/30'
                      }`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold text-sm ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                        </div>
                        <p className={`text-xs mb-2 ${notif.read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="w-full py-4 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  Clear All Notifications
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

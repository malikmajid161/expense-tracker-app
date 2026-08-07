import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Transaction, Wallet, Budget } from '../types';

interface AiAssistantProps {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  userName: string;
  monthlyBudget: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function AiAssistant({ transactions, wallets, budgets, userName, monthlyBudget }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  const systemPrompt = `You are FinTrack AI, a highly intelligent and practical financial advisor.
User: ${userName}.
Data:
- Total Monthly Budget: Rs. ${monthlyBudget}
- Total Balance: Rs. ${totalBalance}
- Income this month: Rs. ${totalIncome}
- Expenses this month: Rs. ${totalExpense}
- Specific Category Budgets: ${JSON.stringify(budgets)}

CRITICAL INSTRUCTIONS:
1. Never act like a generic robot asking "Please review". Give precise, actionable advice.
2. Calculate exactly how much they can spend based on their remaining monthly budget (Total Monthly Budget - Expenses) and balance.
3. FORMATTING IS MANDATORY: You MUST format your response using markdown.
   - Use ### for main headings.
   - Use bullet points (- ) for actionable steps, categorizations, or plans. We render these bullet points as sleek horizontal cards in the UI, so keep them concise and metric-focused (e.g. "- **Groceries**: Allocate Rs. 5000 from current balance.")
   - Avoid long, boring paragraphs. Keep everything structured and highly scannable.`;

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Hello **${userName}**! I am your FinTrack AI. Your current balance is **Rs. ${totalBalance}**. \n\nI can help you:\n- **Analyze your spending**\n- **Suggest budget allocations**\n- **Provide savings plans**\n\nWhat's on your mind today?` }
    ]);
  }, [userName, totalBalance]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        userMessage
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: apiMessages,
          temperature: 0.6,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg shadow-indigo-200 dark:shadow-none mb-4 mx-2 mt-2 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">FinTrack AI</h2>
            <p className="text-indigo-100 text-sm font-medium">Smart Budget Planning</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-5 scrollbar-none pb-4">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                {msg.role === 'user' ? <UserIcon size={16} className="text-slate-500 dark:text-slate-400" /> : <Bot size={16} className="text-indigo-500" />}
              </div>
              <div className={`rounded-3xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-500 text-white rounded-br-sm shadow-md shadow-indigo-200 dark:shadow-none text-sm' 
                  : 'bg-transparent w-full'
              }`}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert prose-indigo max-w-none text-slate-700 dark:text-slate-300">
                    <ReactMarkdown
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2 uppercase tracking-wide" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2 mt-2 mb-4" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex items-start bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-sm text-sm" {...props}>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-3 shrink-0" />
                            <span className="flex-1">{props.children}</span>
                          </li>
                        ),
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-extrabold text-indigo-600 dark:text-indigo-400" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-indigo-500" />
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-bl-sm">
                <Loader2 size={20} className="text-indigo-500 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shrink-0 mb-4 rounded-3xl mx-4">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI for budget advice..." 
            className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-700 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full flex items-center justify-center transition-colors shrink-0 shadow-md"
          >
            <Send size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

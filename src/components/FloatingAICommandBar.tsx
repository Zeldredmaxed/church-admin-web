'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/utils/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function FloatingAICommandBar() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || loading) return;

    // Get current user from localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
      showToast('Please log in to use AI commands', 'error');
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      showToast('Error reading user data', 'error');
      return;
    }

    if (!user.id) {
      showToast('User ID not found', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/admin-agent/command', {
        adminId: user.id,
        command: command.trim(),
      });

      if (response.data.success) {
        showToast(response.data.message || 'Command executed successfully', 'success');
        setCommand('');
      } else {
        showToast(response.data.message || 'Command failed', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to execute command';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  return (
    <>
      {/* Floating Command Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20 px-4 py-3 min-w-[400px] max-w-[600px]">
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Ask AI to do something... (e.g. Message John)"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !command.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Keyboard shortcut hint */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-xs">Ctrl+K</kbd> to focus
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-out">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white border-green-400/20'
                : 'bg-red-500/90 text-white border-red-400/20'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}

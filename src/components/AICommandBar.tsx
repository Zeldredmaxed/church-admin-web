'use client';

import { useState, useEffect } from 'react';
// CRITICAL: Import 'api' from utils, NOT 'axios' directly
// This ensures requests go to Port 3000 (Backend), not 3001 (Frontend)
import api from '@/utils/api'; 
import { Sparkles, X, ArrowRight } from 'lucide-react';

export default function AICommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle with Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    try {
      // 1. Get current user ID from storage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Please log in again');
        return;
      }
      const user = JSON.parse(userStr);

      // 2. Call the AI Endpoint
      // Since we use 'api', this automatically goes to http://localhost:3000
      const response = await api.post('/admin-agent/command', {
        adminId: user.id,
        command: command,
      });

      // 3. Success
      if (response.data.success) {
        alert('✨ AI Success: ' + response.data.message);
        setIsOpen(false);
        setCommand('');
        // Optional: Refresh page to see changes
        window.location.reload();
      } else {
        alert('AI Error: ' + response.data.message);
      }

    } catch (error: any) {
      console.error(error);
      alert('Failed to execute command. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleCommand} className="relative">
          <div className="flex items-center px-4 py-4 border-b border-gray-100">
            <Sparkles className="w-6 h-6 text-purple-600 mr-3 animate-pulse" />
            <input
              autoFocus
              type="text"
              placeholder="Ask AI to do something... (e.g., 'Create an announcement about the picnic')"
              className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-900"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
            {loading ? (
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin ml-3" />
            ) : (
              <button type="submit" className="ml-3 p-2 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors">
                <ArrowRight className="w-5 h-5 text-purple-700" />
              </button>
            )}
          </div>
          <div className="px-4 py-2 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Powered by OpenAI</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white border rounded">↵ Enter to run</span>
              <button type="button" onClick={() => setIsOpen(false)} className="px-2 py-1 bg-white border rounded hover:bg-gray-100">Esc to close</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

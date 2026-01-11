'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { BookOpen, Trash2, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface BibleHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color?: string;
  note?: string;
  createdAt: string;
}

const BIBLE_BOOKS = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Songs',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
];

export default function BibleHighlightsPage() {
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    book: 'John',
    chapter: 1,
    verse: 1,
    note: '',
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bible');
      setHighlights(response.data || []);
    } catch (error: any) {
      console.error('Error fetching highlights:', error);
      alert('Failed to load highlights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.book || !formData.chapter || !formData.verse) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/bible', {
        book: formData.book,
        chapter: parseInt(formData.chapter.toString()),
        verse: parseInt(formData.verse.toString()),
        note: formData.note || undefined,
      });

      // Reset form
      setFormData({
        book: 'John',
        chapter: 1,
        verse: 1,
        note: '',
      });

      // Refresh highlights list
      fetchHighlights();
    } catch (error: any) {
      console.error('Error creating highlight:', error);
      alert(error.response?.data?.message || 'Failed to create highlight. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) {
      return;
    }

    setDeletingId(id);

    try {
      await api.delete(`/bible/${id}`);
      // Refresh highlights list
      fetchHighlights();
    } catch (error: any) {
      console.error('Error deleting highlight:', error);
      alert('Failed to delete highlight. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatReference = (highlight: BibleHighlight): string => {
    return `${highlight.book} ${highlight.chapter}:${highlight.verse}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Loading highlights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pastor's Bible Highlights</h1>
          <p className="text-gray-600 mt-1">Manage and organize key scriptures for upcoming sermons.</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <form onSubmit={handleCreateHighlight} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Book Dropdown */}
            <div>
              <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-2">
                BOOK <span className="text-red-500">*</span>
              </label>
              <select
                id="book"
                required
                value={formData.book}
                onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {BIBLE_BOOKS.map((book) => (
                  <option key={book} value={book}>
                    {book}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Input */}
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                CHAPTER <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="chapter"
                required
                min="1"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Verse Input */}
            <div>
              <label htmlFor="verse" className="block text-sm font-medium text-gray-700 mb-2">
                VERSE <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="verse"
                required
                min="1"
                value={formData.verse}
                onChange={(e) => setFormData({ ...formData, verse: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Note Input */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                NOTE <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="E.g. Theme of redemption..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>Highlight Verse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Highlights List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Saved Highlights</h2>
            <span className="text-sm text-gray-500">{highlights.length} Saved</span>
          </div>
        </div>

        {highlights.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No highlights yet. Create your first highlight above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highlights.map((highlight) => (
                  <tr key={highlight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatReference(highlight)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {highlight.note || (
                          <span className="text-gray-400 italic">No note added</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{formatDate(highlight.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(highlight.id)}
                        disabled={deletingId === highlight.id}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {deletingId === highlight.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

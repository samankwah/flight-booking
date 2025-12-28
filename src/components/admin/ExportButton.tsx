// src/components/admin/ExportButton.tsx
import { useState } from 'react';
import { MdDownload, MdClose } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/apiConfig';

interface ExportButtonProps {
  endpoint: string; // e.g., '/api/admin/export/bookings'
  filename?: string;
  formats?: ('csv' | 'json')[];
}

export default function ExportButton({
  endpoint,
  filename = 'export',
  formats = ['csv', 'json']
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleExport = async (format: 'csv' | 'json') => {
    setLoading(true);
    setShowMenu(false);

    try {
      if (!currentUser) {
        toast.error('You must be logged in to export data');
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const jsonStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
      >
        <MdDownload className="w-4 h-4" />
        {loading ? 'Exporting...' : 'Export'}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 mb-2">
                <span className="text-sm font-semibold text-gray-700">Export as</span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MdClose className="w-4 h-4" />
                </button>
              </div>

              {formats.includes('csv') && (
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition text-sm"
                >
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-gray-500">Comma-separated values</div>
                </button>
              )}

              {formats.includes('json') && (
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition text-sm"
                >
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-gray-500">JavaScript Object Notation</div>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

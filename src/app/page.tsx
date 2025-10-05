'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, FileText, Trash2, Loader2 } from 'lucide-react';

interface CV {
  id: string;
  filename: string;
  content: string;
  uploadedAt: string;
}

interface SearchResult {
  cv: CV;
  similarity: number;
}

export default function Home() {
  const [cvText, setCvText] = useState('');
  const [filename, setFilename] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [totalCVs, setTotalCVs] = useState(0);
  const [activeTab, setActiveTab] = useState<'chromadb' | 'gemini' | 'cohere' | 'jina'>('jina');

  const handleUpload = async () => {
    if (!cvText || !filename) {
      alert('Please provide both filename and CV content');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: cvText }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      alert('CV uploaded successfully!');
      setCvText('');
      setFilename('');
      fetchCVs();
    } catch (error) {
      alert('Failed to upload CV');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      alert('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      let endpoint = '/api/search';

      // Select API endpoint based on active tab
      if (activeTab === 'chromadb') {
        endpoint = '/api/search-local';
      } else if (activeTab === 'gemini') {
        endpoint = '/api/search'; // Update this to your Gemini endpoint when ready
      } else if (activeTab === 'cohere') {
        endpoint = '/api/search'; // Cohere (original endpoint)
      } else if (activeTab === 'jina') {
        endpoint = '/api/search-jina';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 5 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
      setTotalCVs(data.totalCVs);
    } catch (error) {
      alert('Failed to search CVs');
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/cvs');
      const data = await response.json();
      setCvs(data.cvs);
      setTotalCVs(data.count);
    } catch (error) {
      console.error('Failed to fetch CVs:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cvs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      alert('CV deleted successfully!');
      fetchCVs();
      setSearchResults(prev => prev.filter(r => r.cv.id !== id));
    } catch (error) {
      alert('Failed to delete CV');
      console.error(error);
    }
  };

  // Fetch CVs on initial load
  useEffect(() => {
    fetchCVs();
  }, []);

  // Get current engine info
  const getEngineInfo = () => {
    if (activeTab === 'chromadb') {
      return { name: 'LocalEngine ChromaDB', color: 'from-green-600 to-teal-600' };
    } else if (activeTab === 'gemini') {
      return { name: 'Gemini AI', color: 'from-blue-600 to-indigo-600' };
    } else if (activeTab === 'jina') {
      return { name: 'Jina AI', color: 'from-orange-600 to-red-600' };
    } else {
      return { name: 'Cohere AI', color: 'from-purple-600 to-pink-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Semantic CV Search
          </h1>
          <p className="text-gray-600 text-lg">
            Find mobile developers using AI-powered semantic search
          </p>
          <div className="mt-4 inline-block bg-blue-100 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-blue-800">
              {totalCVs} CVs in database
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex gap-1">
            <button
              onClick={() => {
                setActiveTab('chromadb');
                setSearchResults([]);
                fetchCVs();
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'chromadb'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              LocalEngine ChromaDB
            </button>
            <button
              onClick={() => {
                setActiveTab('gemini');
                setSearchResults([]);
                fetchCVs();
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'gemini'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              Gemini
            </button>
            <button
              onClick={() => {
                setActiveTab('cohere');
                setSearchResults([]);
                fetchCVs();
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'cohere'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              Cohere
            </button>
            <button
              onClick={() => {
                setActiveTab('jina');
                setSearchResults([]);
                fetchCVs();
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'jina'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="inline w-4 h-4 mr-2" />
              Jina AI
            </button>
          </div>
        </div>

        {/* Search Interface - shown for all tabs */}
        {(activeTab === 'chromadb' || activeTab === 'gemini' || activeTab === 'cohere' || activeTab === 'jina') && (
          <div className="max-w-6xl mx-auto">
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Search Query
                </label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getEngineInfo().color}`}>
                  <Search className="w-3 h-3 mr-1" />
                  Using: {getEngineInfo().name}
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., mobile developers, iOS expert, Android specialist"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="inline w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['mobile developers', 'iOS expert', 'Android specialist', 'cross-platform engineer', 'backend developer'].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setSearchQuery(example);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Top {searchResults.length} Results for "{searchQuery}"
                </h2>

                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={result.cv.id}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {result.cv.filename}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                Similarity: {(result.similarity * 100).toFixed(2)}%
                              </span>
                              <span>•</span>
                              <span>
                                Uploaded: {new Date(result.cv.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(result.cv.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 max-h-40 overflow-y-auto">
                        {result.cv.content.substring(0, 500)}
                        {result.cv.content.length > 500 && '...'}
                      </div>

                      <div className="mt-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${result.similarity * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try a different search query or upload more CVs
                </p>
              </div>
            )}

            {/* Empty State */}
            {totalCVs === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No CVs uploaded yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload some CVs to start searching
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Upload
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Link2,
  Copy,
  Check,
  Trash2,
  QrCode,
  BarChart3,
  ExternalLink,
  Calendar,
  MousePointerClick,
  Globe,
  Monitor,
  Smartphone,
  History,
  X,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { API_URL } = useAuth();

  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  // URL management states
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [shortening, setShortening] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected URL analytics states
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modal / Feedback states
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load URL list on mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoadingUrls(true);
      const res = await axios.get(`${API_URL}/urls`);
      setUrls(res.data);
      // Auto-select the first URL for analytics if available
      if (res.data.length > 0 && !selectedUrl) {
        handleSelectUrl(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching URLs:', err);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setFormError('');
    setShortening(true);

    try {
      const res = await axios.post(`${API_URL}/urls/shorten`, {
        originalUrl: longUrl,
        customAlias: customAlias,
        expiry: expiry
      });
      setUrls((prev) => [res.data, ...prev]);
      setLongUrl('');
      handleSelectUrl(res.data); // select the newly created URL
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setShortening(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // prevent selecting the URL card
    if (!window.confirm('Are you sure you want to delete this short URL and all its analytics?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/urls/${id}`);
      setUrls((prev) => prev.filter((u) => u._id !== id));

      // If deleted URL was selected, clear analytics or select another
      if (selectedUrl && selectedUrl._id === id) {
        setSelectedUrl(null);
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Error deleting URL:', err);
      alert('Could not delete URL.');
    }
  };

  const handleSelectUrl = async (url) => {
    setSelectedUrl(url);
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${API_URL}/urls/${url._id}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleCopy = (id, shortUrl, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerQrModal = (shortUrl, e) => {
    e.stopPropagation();
    setActiveQrUrl(shortUrl);
  };

  const downloadQrCode = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 300, 300);
      context.drawImage(image, 10, 10, 280, 280);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'shortnify-qr.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    image.src = `data:image/svg+xml;base64,${svgBase64}`;
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#0b0f19] py-8 px-4 md:px-12 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top: Shorten Form */}
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accentBlue/5 rounded-full blur-[80px] pointer-events-none"></div>

          <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center space-x-2">
            <Link2 className="h-6 w-6 text-accentBlue" />
            <span>Shorten a new URL</span>
          </h2>
          <p className="text-slate-400 text-sm mb-6">Enter a long, messy link below to generate a sleek, trackable shortcut.</p>

          <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-4">

            {/* URL INPUT */}
            <input
              type="text"
              placeholder="Paste your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm"
            />

            {/* ALIAS INPUT */}
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm"
            />

            {/* EXPIRY INPUT */}
            <div className="flex flex-col w-full">
              <label className="text-xs text-slate-400 mb-1">
                Expiry Date & Time
              </label>

              <input
                type="datetime-local"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={shortening}
              className="gradient-primary text-white font-semibold px-8 py-4 rounded-xl"
            >
              Shorten URL
            </button>

          </form>

          {formError && (
            <p className="text-red-400 text-sm mt-3 flex items-center space-x-1">
              <span>⚠</span>
              <span>{formError}</span>
            </p>
          )}
        </div>

        {/* Bottom Panel: Two Column layout (URLs List + Analytics Viewer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: URLs List (Span 5) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">


              <h3 className="font-bold text-lg text-slate-300">My Links ({urls.length})</h3>
              <button
                onClick={fetchUrls}
                className="text-xs text-accentBlue hover:underline font-semibold"
              >
                Refresh List
              </button>
            </div>

            {loadingUrls ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentBlue border-t-transparent mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Loading links...</p>
              </div>
            ) : urls.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/5 text-slate-400">
                <Link2 className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <p className="font-semibold text-slate-300">No links shortened yet</p>
                <p className="text-sm mt-1">Shorten a link above to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {urls.map((u) => {
                  const isSelected = selectedUrl && selectedUrl._id === u._id;
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleSelectUrl(u)}
                      className={`glass-card p-5 rounded-xl border cursor-pointer transition-smooth text-left relative flex flex-col justify-between ${isSelected
                        ? 'border-accentBlue/60 bg-accentBlue/5 shadow-lg shadow-accentBlue/5'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                        }`}
                    >
                      <div>
                        {/* Title & Click Count badge */}
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-1 rounded-md max-w-[150px] truncate">
                            /{u.shortCode}
                          </span>
                          <span className="text-xs bg-accentCyan/10 text-accentCyan font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-accentCyan"></span>
                            <span>{u.clicks} clicks</span>
                          </span>
                        </div>

                        {/* Short URL (Link) */}
                        <h4 className="font-bold text-slate-100 break-all select-all flex items-center space-x-1.5 group">
                          <span>{u.shortUrl}</span>
                        </h4>

                        {/* Original URL */}
                        <p className="text-slate-500 text-xs mt-1.5 truncate max-w-full break-all">
                          {u.originalUrl}
                        </p>
                      </div>

                      {/* Card Operations */}
                      <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-slate-400">
                        <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          {u.expiryDate && (
                            <span className="text-xs text-red-400 block mt-1">
                              Expires: {new Date(u.expiryDate).toLocaleString()}
                            </span>
                          )}
                        </span>

                        <div className="flex items-center space-x-3">

                          {/* COPY BUTTON + TEXT */}
                          <div className="flex items-center">
                            <button
                              onClick={(e) => handleCopy(u._id, u.shortUrl, e)}
                              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-smooth cursor-pointer"
                              title="Copy Short Link"
                            >
                              {copiedId === u._id ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>

                            {/* ✅ NEW ADDED */}
                            {copiedId === u._id && (
                              <span className="ml-2 text-xs text-green-400 animate-pulse">
                                Copied!
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(u.shortUrl, "_blank");
                            }}
                            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-smooth cursor-pointer"
                            title="Open Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          {/* QR BUTTON */}
                          <button
                            onClick={(e) => triggerQrModal(u.shortUrl, e)}
                            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-smooth cursor-pointer"
                            title="Generate QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={(e) => handleDelete(u._id, e)}
                            className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-smooth cursor-pointer"
                            title="Delete URL"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Analytics Panel (Span 7) */}
          <div className="lg:col-span-7">
            {!selectedUrl ? (
              <div className="glass-card h-full rounded-2xl p-16 border border-white/5 flex flex-col items-center justify-center text-center text-slate-500">
                <BarChart3 className="h-16 w-16 text-slate-700 mb-4 animate-pulse" />
                <p className="font-bold text-lg text-slate-400">Select a Link to view traffic analytics</p>
                <p className="text-sm max-w-sm mt-2">Choose any shortened link from your list on the left to pull detailed, real-time traffic statistics.</p>
              </div>
            ) : loadingAnalytics ? (
              <div className="glass-card h-full rounded-2xl p-16 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-accentCyan border-t-transparent mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">Fetching analytics dashboard data...</p>
              </div>
            ) : !analytics ? (
              <div className="glass-card h-full rounded-2xl p-16 border border-white/5 flex flex-col items-center justify-center text-center text-red-400">
                <p>Could not fetch analytics. Please try again.</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Stats Header Bar */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="max-w-[70%] text-left">
                    <h3 className="font-bold text-lg text-slate-100 flex items-center space-x-2 truncate">
                      <span>Analytics Dashboard</span>
                    </h3>
                    <a
                      href={selectedUrl.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accentBlue hover:underline flex items-center space-x-1 mt-1 truncate"
                    >
                      <span className="truncate">{selectedUrl.originalUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block uppercase font-semibold">Last Visited</span>
                    <span className="text-xs text-slate-300 font-bold block mt-0.5">
                      {analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleDateString() + ' ' + new Date(analytics.lastVisited).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5 rounded-xl border border-white/5 text-left">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <MousePointerClick className="h-4 w-4 text-accentCyan" />
                      <span>Total Clicks</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white">{analytics.clicks}</div>
                  </div>
                  <div className="glass-card p-5 rounded-xl border border-white/5 text-left">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <History className="h-4 w-4 text-accentIndigo" />
                      <span>Visits Logged</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white">{analytics.stats.trends.reduce((acc, curr) => acc + curr.clicks, 0)}</div>
                  </div>
                </div>

                {/* Main Graph: Click Trends */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 text-left">
                  <h4 className="font-bold text-sm text-slate-300 mb-4 flex items-center space-x-1.5">
                    <BarChart3 className="h-4.5 w-4.5 text-accentBlue" />
                    <span>Click Trends (Last 7 Active Days)</span>
                  </h4>
                  {analytics.stats.trends.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                      No visits logged yet to show a click trend.
                    </div>
                  ) : (
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.stats.trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Audience Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Browsers */}
                  <div className="glass-card p-4 rounded-2xl border border-white/5 text-left">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1">
                      <Globe className="h-4 w-4 text-cyan-400" />
                      <span>Browsers</span>
                    </h4>
                    {analytics.stats.browsers.length === 0 ? (
                      <p className="text-xs text-slate-600">No data</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.stats.browsers.map((b) => (
                          <div key={b.name} className="text-sm">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-300">{b.name}</span>
                              <span className="text-slate-400">{b.value} ({Math.round((b.value / analytics.clicks) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(b.value / analytics.clicks) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OS */}
                  <div className="glass-card p-4 rounded-2xl border border-white/5 text-left">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1">
                      <Monitor className="h-4 w-4 text-accentBlue" />
                      <span>OS</span>
                    </h4>
                    {analytics.stats.os.length === 0 ? (
                      <p className="text-xs text-slate-600">No data</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.stats.os.map((o) => (
                          <div key={o.name} className="text-sm">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-300">{o.name}</span>
                              <span className="text-slate-400">{o.value} ({Math.round((o.value / analytics.clicks) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(o.value / analytics.clicks) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Devices */}
                  <div className="glass-card p-4 rounded-2xl border border-white/5 text-left">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1">
                      <Smartphone className="h-4 w-4 text-purple-400" />
                      <span>Devices</span>
                    </h4>
                    {analytics.stats.devices.length === 0 ? (
                      <p className="text-xs text-slate-600">No data</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.stats.devices.map((d) => (
                          <div key={d.name} className="text-sm">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-300">{d.name}</span>
                              <span className="text-slate-400">{d.value} ({Math.round((d.value / analytics.clicks) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(d.value / analytics.clicks) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Visit History Grid Table */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 text-left">
                  <h4 className="font-bold text-sm text-slate-300 mb-4 flex items-center space-x-1.5">
                    <History className="h-4.5 w-4.5 text-accentCyan" />
                    <span>Recent Visitor Logs (Last 10 Click Actions)</span>
                  </h4>
                  {analytics.recentHistory.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No visit records logged.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400">
                            <th className="py-2.5 font-semibold">Timestamp</th>
                            <th className="py-2.5 font-semibold">IP Address</th>
                            <th className="py-2.5 font-semibold">Browser</th>
                            <th className="py-2.5 font-semibold">OS</th>
                            <th className="py-2.5 font-semibold">Device</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {analytics.recentHistory.map((h) => (
                            <tr key={h._id} className="hover:bg-white/2 transition-smooth">
                              <td className="py-2.5 font-medium">{new Date(h.timestamp).toLocaleString()}</td>
                              <td className="py-2.5 text-slate-400">{h.ipAddress}</td>
                              <td className="py-2.5">{h.browser}</td>
                              <td className="py-2.5">{h.os}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${h.device === 'Mobile' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                  }`}>
                                  {h.device}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* QR Code Popup Modal */}
      {activeQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center relative">
            <button
              onClick={() => setActiveQrUrl(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-smooth cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1">Generated QR Code</h3>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-[80%] break-all">{activeQrUrl}</p>

            <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
              <QRCodeSVG
                id="qr-svg"
                value={activeQrUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
              />
            </div>

            <button
              onClick={downloadQrCode}
              className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-accentBlue/25 hover:scale-[1.01] transition-smooth flex items-center justify-center space-x-2 cursor-pointer"
            >
              <QrCode className="h-5 w-5" />
              <span>Download Image (PNG)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

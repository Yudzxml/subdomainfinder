'use client';

import { motion } from 'framer-motion';
import { Search, Shield, Globe, AlertTriangle } from 'lucide-react';

interface ScanInputProps {
  onScan: (domain: string) => void;
  isScanning: boolean;
}

export function ScanInput({ onScan, isScanning }: ScanInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const domain = formData.get('domain') as string;
    if (domain && domain.trim()) {
      onScan(domain.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Subdomain Intelligence
        </h1>
        <p className="text-center text-gray-400 mb-8 text-lg">
          Advanced Cloudflare detection & security scanner
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Globe className="absolute left-4 text-gray-500 w-5 h-5" />
            <input
              type="text"
              name="domain"
              placeholder="Enter domain (e.g., webtoons.com)"
              disabled={isScanning}
              className="w-full pl-12 pr-40 py-4 bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              pattern="[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Enter a valid domain name"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="absolute right-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Cloudflare Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>WAF Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Multi-Source Enumeration</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
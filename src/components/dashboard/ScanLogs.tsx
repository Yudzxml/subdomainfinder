'use client';

import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ScanLog } from '@/types/scan';

interface ScanLogsProps {
  logs: ScanLog[];
  isScanning: boolean;
}

const PHASE_ICONS = {
  enumeration: Terminal,
  dns_resolution: Clock,
  http_check: CheckCircle,
  cloudflare_detection: CheckCircle,
  waf_detection: CheckCircle,
  ssl_analysis: CheckCircle,
  headers_analysis: CheckCircle,
  risk_analysis: AlertCircle,
  finalizing: CheckCircle,
  error: XCircle,
};

const PHASE_COLORS = {
  enumeration: 'text-blue-400',
  dns_resolution: 'text-purple-400',
  http_check: 'text-green-400',
  cloudflare_detection: 'text-orange-400',
  waf_detection: 'text-yellow-400',
  ssl_analysis: 'text-cyan-400',
  headers_analysis: 'text-pink-400',
  risk_analysis: 'text-red-400',
  finalizing: 'text-green-400',
  error: 'text-red-400',
};

export function ScanLogs({ logs, isScanning }: ScanLogsProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold text-white">Scan Activity Log</span>
        {isScanning && (
          <Badge variant="outline" className="ml-auto border-green-500/50 text-green-400 text-xs">
            Live
          </Badge>
        )}
      </div>

      <div className="bg-black/80 border border-gray-800 rounded-lg overflow-hidden">
        <ScrollArea className="h-[300px]">
          <div className="p-4 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Waiting for scan to start...
              </div>
            ) : (
              logs.map((log, index) => {
                const Icon = PHASE_ICONS[log.phase as keyof typeof PHASE_ICONS] || Terminal;
                const color = PHASE_COLORS[log.phase as keyof typeof PHASE_COLORS] || 'text-gray-400';

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 py-1"
                  >
                    <span className="text-gray-600 shrink-0">{formatTime(log.timestamp)}</span>
                    <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${color}`} />
                    <span className="text-gray-300 break-words flex-1">
                      {log.message}
                      {log.subdomain && (
                        <span className="text-blue-400 ml-1">({log.subdomain})</span>
                      )}
                    </span>
                    {log.details && (
                      <div className="mt-1 ml-4 text-gray-500 text-[10px]">
                        {typeof log.details === 'string'
                          ? log.details
                          : JSON.stringify(log.details, null, 2)
                            .split('\n')
                            .map((line, i) => (
                              <div key={i}>  {line}</div>
                            ))
                        }
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}

            {isScanning && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-gray-500 mt-2"
              >
                Scanning in progress...
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
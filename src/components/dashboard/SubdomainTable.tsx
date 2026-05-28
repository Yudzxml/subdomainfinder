'use client';

import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Lock,
  ExternalLink,
  Copy,
  Heart,
  HeartOff,
} from 'lucide-react';
import { SubdomainResult } from '@/types/scan';
import { useScanStore } from '@/store/scan-store';

interface SubdomainTableProps {
  subdomains: SubdomainResult[];
  onSelect: (subdomain: SubdomainResult) => void;
}

export function SubdomainTable({ subdomains, onSelect }: SubdomainTableProps) {
  const { addToFavorites, removeFromFavorites, favoriteDomains } = useScanStore();

  const getStatusBadge = (status: number | null) => {
    if (!status) {
      return <Badge variant="secondary" className="text-gray-500">N/A</Badge>;
    }
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">{status}</Badge>;
    }
    if (status >= 300 && status < 400) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">{status}</Badge>;
    }
    if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">{status}</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">{status}</Badge>;
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Critical</Badge>;
    if (score >= 50) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">High</Badge>;
    if (score >= 25) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Medium</Badge>;
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Low</Badge>;
  };

  const toggleFavorite = (e: React.MouseEvent, subdomain: string) => {
    e.stopPropagation();
    if (favoriteDomains.includes(subdomain)) {
      removeFromFavorites(subdomain);
    } else {
      addToFavorites(subdomain);
    }
  };

  const copySubdomain = (e: React.MouseEvent, subdomain: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(subdomain);
  };

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800/50">
              <TableHead className="text-gray-400 font-medium">Subdomain</TableHead>
              <TableHead className="text-gray-400 font-medium">Status</TableHead>
              <TableHead className="text-gray-400 font-medium">Response</TableHead>
              <TableHead className="text-gray-400 font-medium">Security</TableHead>
              <TableHead className="text-gray-400 font-medium">Tech Stack</TableHead>
              <TableHead className="text-gray-400 font-medium">Risk</TableHead>
              <TableHead className="text-gray-400 font-medium">Location</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subdomains.map((item, index) => (
              <motion.tr
                key={item.subdomain}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                onClick={() => onSelect(item)}
                className="border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.alive ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className="truncate max-w-[200px]">{item.subdomain}</span>
                    {item.riskScore >= 50 && (
                      <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
                    )}
                  </div>
                  {item.title && (
                    <div className="text-xs text-gray-500 truncate mt-1">{item.title}</div>
                  )}
                </TableCell>

                <TableCell>
                  {getStatusBadge(item.status)}
                  {item.ssl && (
                    <Lock className="w-3 h-3 text-green-400 ml-2" />
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.responseTime}ms</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.cloudflare ? (
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        CF
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        No CF
                      </Badge>
                    )}
                    {item.waf.slice(0, 2).map((waf) => (
                      <Badge key={waf} variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                        {waf}
                      </Badge>
                    ))}
                    {item.waf.length > 2 && (
                      <Badge variant="outline" className="border-gray-700 text-gray-500 text-xs">
                        +{item.waf.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {item.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                    {item.techStack.length > 3 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{item.techStack.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(item.riskScore)}
                    <span className="text-xs text-gray-500">{item.riskScore}%</span>
                  </div>
                </TableCell>

                <TableCell className="text-gray-400 text-sm">
                  {item.country}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => toggleFavorite(e, item.subdomain)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title={favoriteDomains.includes(item.subdomain) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favoriteDomains.includes(item.subdomain) ? (
                        <Heart className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Heart className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={(e) => copySubdomain(e, item.subdomain)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <a
                      href={`https://${item.subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title="Open"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>

        {subdomains.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No subdomains found</p>
          </div>
        )}
      </div>
    </div>
  );
}
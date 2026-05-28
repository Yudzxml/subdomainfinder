'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import { useScanStore } from '@/store/scan-store';
import { WAF_TYPES } from '@/types/scan';

export function FilterBar() {
  const {
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    exportData,
    filteredSubdomains,
  } = useScanStore();

  const toggleFilter = (filterKey: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filterKey]: filters[filterKey] === undefined ? true : undefined,
    });
  };

  const setWafFilter = (waf: string) => {
    setFilters({
      ...filters,
      waf: filters.waf === waf ? undefined : waf,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchQuery.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 p-4 bg-black/50 backdrop-blur-xl border border-gray-800 rounded-xl"
    >
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search subdomains, titles, IPs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black/50 border-gray-700 text-white placeholder-gray-500 focus:border-green-500"
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={filters.cloudflare !== undefined ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              Cloudflare
              {filters.cloudflare !== undefined && (
                <Badge variant="secondary" className="ml-1">
                  {filters.cloudflare ? 'On' : 'Off'}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Cloudflare Protection</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters({ ...filters, cloudflare: true })}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Protected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, cloudflare: false })}>
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Not Protected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, cloudflare: undefined })}>
              All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={filters.alive ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('alive')}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Alive
        </Button>

        <Button
          variant={filters.dead ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('dead')}
          className="gap-2"
        >
          <XCircle className="w-4 h-4" />
          Dead
        </Button>

        <Button
          variant={filters.status200 ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('status200')}
          className="gap-2"
        >
          HTTP 200
        </Button>

        <Button
          variant={filters.highRisk ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('highRisk')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          High Risk
        </Button>

        <Button
          variant={filters.adminPortal ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleFilter('adminPortal')}
          className="gap-2"
        >
          Admin Portal
        </Button>

        {/* WAF Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={filters.waf ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              WAF
              {filters.waf && (
                <Badge variant="secondary" className="ml-1">
                  {filters.waf}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Web Application Firewall</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WAF_TYPES.map((waf) => (
              <DropdownMenuItem key={waf} onClick={() => setWafFilter(waf)}>
                {filters.waf === waf && <CheckCircle className="w-4 h-4 mr-2" />}
                {waf}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export buttons */}
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportData('json')}>JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('csv')}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('txt')}>TXT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing {filteredSubdomains.length} result(s)</span>
        {hasActiveFilters && (
          <span className="text-xs text-gray-500">Filters active</span>
        )}
      </div>
    </motion.div>
  );
}
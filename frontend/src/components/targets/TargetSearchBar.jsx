import React from 'react';
import { Search } from 'lucide-react';

/**
 * TargetSearchBar component
 * Text search filter input combined with target type and check method selector dropdowns
 */
export default function TargetSearchBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  methodFilter,
  onMethodFilterChange
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
      <div className="relative flex-1 max-w-md">
        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search targets by name, URL, or IP address..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input pl-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="form-input text-xs w-auto"
        >
          <option value="all">All Types</option>
          <option value="website">Website</option>
          <option value="http_service">HTTP Service</option>
          <option value="host">Host / Node</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => onMethodFilterChange(e.target.value)}
          className="form-input text-xs w-auto"
        >
          <option value="all">All Methods</option>
          <option value="http">HTTP Probing</option>
          <option value="icmp">ICMP Ping</option>
        </select>
      </div>
    </div>
  );
}

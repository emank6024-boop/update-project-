import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import { AdminAPI } from '../api';
import { AppUserRecord, Pagination } from '../types';

interface AdminUsersProps {
  onSelectUserDetail: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onSelectUserDetail }) => {
  const [users, setUsers] = useState<AppUserRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AdminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user directory.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user: AppUserRecord) => {
    try {
      const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
      await AdminAPI.setUserStatus(user.id, nextStatus);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">User Directory</h2>
          <p className="text-xs text-[var(--text-secondary)]">Manage registered citizens, role access, and account statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by citizen name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Providers</option>
            <option value="google">Google</option>
            <option value="email">Email</option>
            <option value="guest">Demo / Guest</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-secondary)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Citizen User</th>
                <th className="py-3 px-4">Auth Provider</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Activity</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent)]" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-xs uppercase">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{u.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] text-[11px] font-medium">
                        {u.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px]">{u.preferredLanguage}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Deactivated
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{u.stats?.aiRequestsCount || 0}</span> requests
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {new Date(u.lastActiveAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectUserDetail(u.id)}
                        className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-primary)] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.status === 'active'
                            ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                            : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                        title={u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      >
                        {u.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="py-3 px-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} citizens
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

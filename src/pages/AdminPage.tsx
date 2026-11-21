import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ShieldAlert,
  Users,
  Activity,
  Server,
  FileText,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'health' | 'audit' | 'tickets'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample SaaS users for admin demonstration
  const [mockUsers] = useState([
    {
      id: 'usr_8923a10',
      name: 'Rahim Chowdhury',
      email: 'rahim@example.com',
      tier: 'Pro',
      status: 'Active',
      joined: '2026-10-14',
      recordsCount: 142,
    },
    {
      id: 'usr_4719b21',
      name: 'Karim Ullah',
      email: 'karim@example.com',
      tier: 'Free',
      status: 'Active',
      joined: '2026-11-02',
      recordsCount: 48,
    },
    {
      id: 'usr_9012c34',
      name: 'Tanisha Khan',
      email: 'tanisha@example.com',
      tier: 'Pro',
      status: 'Active',
      joined: '2026-11-08',
      recordsCount: 215,
    },
    {
      id: user?.id || 'usr_current',
      name: user?.fullName || 'Current User',
      email: user?.email || 'user@finora.io',
      tier: 'Enterprise',
      status: 'Active',
      joined: '2026-11-19',
      recordsCount: 310,
    },
  ]);

  // Sample Audit Logs
  const [mockAuditLogs] = useState([
    {
      id: 'aud_1',
      action: 'LOGIN_SUCCESS',
      user: 'user@finora.io',
      ip: '103.114.98.24',
      timestamp: '2 mins ago',
      status: 'success',
    },
    {
      id: 'aud_2',
      action: 'RLS_SECURITY_CHECK',
      user: 'system',
      ip: 'internal',
      timestamp: '15 mins ago',
      status: 'success',
    },
    {
      id: 'aud_3',
      action: 'DATA_EXPORT_REQUEST',
      user: 'rahim@example.com',
      ip: '182.160.118.5',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: 'aud_4',
      action: 'FAILED_PASSWORD_ATTEMPT',
      user: 'suspicious_ip',
      ip: '45.134.20.11',
      timestamp: '3 hours ago',
      status: 'blocked',
    },
  ]);

  // Sample Support Tickets
  const [mockTickets] = useState([
    {
      id: 'tkt_101',
      subject: 'Exchange rate query for BDT/USD',
      user: 'tanisha@example.com',
      priority: 'medium',
      status: 'open',
      date: 'Today',
    },
    {
      id: 'tkt_102',
      subject: 'Receipt upload format question',
      user: 'karim@example.com',
      priority: 'low',
      status: 'resolved',
      date: 'Yesterday',
    },
  ]);

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Administration Panel
            </h1>
            <Badge variant="warning" className="gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System overview, user isolation audit, database health, and support tickets
          </p>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Lock className="w-4 h-4" />
          <span>RLS Enforced: 100% Isolated</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">1,420</p>
          <span className="text-[11px] text-emerald-500 font-bold mt-1 inline-block">+18% this month</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">PostgreSQL Status</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">Healthy</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">15 Tables · 0 Leaks</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Uptime (30d)</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">99.98%</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Avg Latency: 42ms</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Open Tickets</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">1</p>
          <span className="text-[11px] text-amber-500 font-bold mt-1 inline-block">Requires Response</span>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'health'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health & Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support Desk</span>
        </button>
      </div>

      {/* Tab 1: User Directory */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <span className="text-xs text-slate-400 self-end sm:self-auto">
              Total {filteredUsers.length} accounts found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Account ID</th>
                  <th className="py-3 px-4">SaaS Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Data Isolation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{u.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {u.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="income">{u.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.joined}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>RLS Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: System Health & Architecture */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              <span>Database & Infrastructure Health</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Supabase PostgreSQL Core
                </span>
                <Badge variant="income">Online · 99.98%</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Row Level Security (RLS) Status
                </span>
                <Badge variant="income">15 of 15 Tables Enforced</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Storage Buckets (receipts, avatars)
                </span>
                <Badge variant="income">Active · Private Keys</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Vercel Edge CDN & Deployment
                </span>
                <Badge variant="income">Connected · Fast Global CDN</Badge>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Security Protocols in Force</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Cross-User Access:</strong> All queries are strictly scoped to the caller's JWT user UUID.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Client Secrets Exposed:</strong> Only anon public key is used; service_role is strictly quarantined.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Decimal.js Calculation:</strong> High-precision banking math avoids 0.1 + 0.2 floating point drift.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>GDPR Compliance:</strong> Users possess instant one-click data export and account purge options.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Security Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.user}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ip}</td>
                    <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={log.status === 'success' ? 'income' : 'expense'}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Support Tickets */}
      {activeTab === 'tickets' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Support Requests</h3>
            <span className="text-xs text-slate-400">Total 2 tickets</span>
          </div>

          <div className="space-y-3">
            {mockTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</span>
                    <Badge variant={t.status === 'open' ? 'warning' : 'income'}>{t.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    From: {t.user} · Submitted: {t.date} · Priority: {t.priority.toUpperCase()}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs self-start sm:self-auto">
                  Respond
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  LayoutDashboard, Users, BookOpen, MessageSquare, Tag, BarChart2,
  Calendar, FileText, QrCode, ChevronRight, LogOut, Menu, X
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import BookedStudentsSection from './BookedStudentsSection';
import AttendanceManager from './AttendanceManager';
import AdminSupportMessages from './AdminSupportMessages';
import AdminEnquiriesTab from './AdminEnquiriesTab';
import CourseMaterialsManager from './CourseMaterialsManager';
import ClassSessionsManager from './ClassSessionsManager';
import DiscountCodeManager from './DiscountCodeManager';
import VisitorTrackingView from './VisitorTrackingView';

type AdminTab =
  | 'overview'
  | 'students'
  | 'attendance'
  | 'support'
  | 'enquiries'
  | 'materials'
  | 'sessions'
  | 'discounts'
  | 'analytics';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Main' },
  { id: 'students', label: 'Students', icon: Users, group: 'Main' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, group: 'Main' },
  { id: 'support', label: 'Support Messages', icon: MessageSquare, group: 'Communication' },
  { id: 'enquiries', label: 'Enquiries', icon: FileText, group: 'Communication' },
  { id: 'materials', label: 'Course Materials', icon: BookOpen, group: 'Content' },
  { id: 'sessions', label: 'Class Sessions', icon: QrCode, group: 'Content' },
  { id: 'discounts', label: 'Discount Codes', icon: Tag, group: 'Content' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, group: 'Reports' },
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const groups = [...new Set(navItems.map((i) => i.group))];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'students':
        return <BookedStudentsSection />;
      case 'attendance':
        return <AttendanceManager />;
      case 'support':
        return <AdminSupportMessages />;
      case 'enquiries':
        return <AdminEnquiriesTab />;
      case 'materials':
        return <CourseMaterialsManager />;
      case 'sessions':
        return <ClassSessionsManager />;
      case 'discounts':
        return <DiscountCodeManager />;
      case 'analytics':
        return <VisitorTrackingView />;
      default:
        return null;
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'}`}
      style={{ background: 'var(--navy)' }}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b" style={{ borderColor: 'oklch(1 0 0 / 0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gold)' }}
          >
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
            >
              R
            </span>
          </div>
          <div>
            <div
              className="text-sm font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Panel
            </div>
            <div className="text-xs" style={{ color: 'var(--gold)' }}>
              Rajat's Equation
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {groups.map((group) => (
          <div key={group} className="mb-6">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: 'oklch(0.50 0.03 240)' }}
            >
              {group}
            </div>
            {navItems
              .filter((item) => item.group === group)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`sidebar-item w-full mb-1 ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'oklch(1 0 0 / 0.1)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--cream)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0" style={{ width: '256px' }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-4 bg-white border-b"
          style={{ borderColor: 'oklch(0.88 0.015 240)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} style={{ color: 'var(--navy)' }} />
            </button>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
              >
                {navItems.find((i) => i.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs" style={{ color: 'oklch(0.55 0.03 240)' }}>
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'oklch(0.72 0.12 75 / 0.12)', color: 'oklch(0.55 0.14 75)' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Admin
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const OverviewPanel: React.FC = () => {
  const stats = [
    { label: 'Total Students', value: '—', icon: Users, color: 'var(--navy)' },
    { label: 'Active Sessions', value: '—', icon: Calendar, color: 'var(--gold)' },
    { label: 'Course Materials', value: '—', icon: BookOpen, color: 'oklch(0.55 0.15 145)' },
    { label: 'Support Messages', value: '—', icon: MessageSquare, color: 'oklch(0.55 0.18 280)' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
        >
          Welcome back, Admin
        </h2>
        <p style={{ color: 'oklch(0.50 0.03 240)' }}>
          Here's an overview of your mathematics platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-6 bg-white"
              style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${stat.color}18` }}
              >
                <Icon size={22} style={{ color: stat.color }} />
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'oklch(0.55 0.03 240)' }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div
        className="rounded-xl p-6 bg-white"
        style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
        >
          Quick Actions
        </h3>
        <p className="text-sm" style={{ color: 'oklch(0.55 0.03 240)' }}>
          Use the sidebar navigation to manage students, sessions, materials, and more.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  useIsCallerAdmin,
  useGetCallerUserProfile,
  useBookingRecords,
  useMarkAsPaid,
  useDeleteBooking,
  useConfirmPaymentAndGenerateAccessCode,
  useGetAllSupportMessages,
  useGetDiscountCodes,
  useGetPaymentEnquiries,
  useGetAllEnquiries,
} from '../hooks/useQueries';
import BookedStudentsSection from './BookedStudentsSection';
import AdminSupportMessages from './AdminSupportMessages';
import AttendanceManager from './AttendanceManager';
import CourseMaterialsManager from './CourseMaterialsManager';
import ClassSessionsManager from './ClassSessionsManager';
import DiscountCodeManager from './DiscountCodeManager';
import VisitorTrackingView from './VisitorTrackingView';
import AdminEnquiriesTab from './AdminEnquiriesTab';
import {
  Users,
  MessageSquare,
  BarChart2,
  BookOpen,
  Calendar,
  Tag,
  Eye,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AdminTab =
  | 'analytics'
  | 'support'
  | 'attendance'
  | 'materials'
  | 'sessions'
  | 'discounts'
  | 'visitors'
  | 'enquiries'
  | 'paymentEnquiries';

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'analytics', label: 'Booked Students', icon: <Users className="w-4 h-4" />, group: 'Students' },
  { id: 'attendance', label: 'Attendance', icon: <ClipboardList className="w-4 h-4" />, group: 'Students' },
  { id: 'support', label: 'Support Messages', icon: <MessageSquare className="w-4 h-4" />, group: 'Communication' },
  { id: 'enquiries', label: 'Enquiries', icon: <FileText className="w-4 h-4" />, group: 'Communication' },
  { id: 'paymentEnquiries', label: 'Payment Enquiries', icon: <BarChart2 className="w-4 h-4" />, group: 'Communication' },
  { id: 'materials', label: 'Course Materials', icon: <BookOpen className="w-4 h-4" />, group: 'Content' },
  { id: 'sessions', label: 'Class Sessions', icon: <Calendar className="w-4 h-4" />, group: 'Content' },
  { id: 'discounts', label: 'Discount Codes', icon: <Tag className="w-4 h-4" />, group: 'Settings' },
  { id: 'visitors', label: 'Visitor Tracking', icon: <Eye className="w-4 h-4" />, group: 'Settings' },
];

export default function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: profile } = useGetCallerUserProfile();
  const { data: supportMessages = [] } = useGetAllSupportMessages();
  const { data: enquiries = [] } = useGetAllEnquiries();

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges to access this dashboard.</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  const unrepliedCount = supportMessages.filter((m: any) => !m.reply).length;
  const pendingEnquiries = enquiries.filter((e: any) => {
    const status = e.status;
    if (!status) return false;
    if (typeof status === 'string') return status === 'pending';
    return 'pending' in status;
  }).length;

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <BookedStudentsSection />;
      case 'support':
        return <AdminSupportMessages />;
      case 'attendance':
        return <AttendanceManager />;
      case 'materials':
        return <CourseMaterialsManager />;
      case 'sessions':
        return <ClassSessionsManager />;
      case 'discounts':
        return <DiscountCodeManager />;
      case 'visitors':
        return <VisitorTrackingView />;
      case 'enquiries':
        return <AdminEnquiriesTab />;
      case 'paymentEnquiries':
        return <PaymentEnquiriesView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Admin Panel</p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {profile?.name ?? 'Administrator'}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                    const badge =
                      item.id === 'support' && unrepliedCount > 0
                        ? unrepliedCount
                        : item.id === 'enquiries' && pendingEnquiries > 0
                        ? pendingEnquiries
                        : null;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1 text-left">{item.label}</span>
                        {badge && (
                          <Badge variant="destructive" className="text-xs h-5 px-1.5">
                            {badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

// Inline payment enquiries view
function PaymentEnquiriesView() {
  const { data: enquiries = [], isLoading } = useGetPaymentEnquiries();

  if (isLoading) {
    return <div className="text-muted-foreground">Loading payment enquiries...</div>;
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No payment enquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enquiries.map((enquiry: any, index: number) => (
        <div key={index} className="bg-card rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{enquiry.studentName}</p>
              <p className="text-sm text-muted-foreground">{enquiry.contactNumber}</p>
            </div>
            <Badge variant="outline">#{String(enquiry.id)}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Fee Type: </span>
              <span className="text-foreground">{enquiry.feeType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount: </span>
              <span className="text-foreground">₹{String(enquiry.amount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration: </span>
              <span className="text-foreground">
                {enquiry.durationStart} – {enquiry.durationEnd}
              </span>
            </div>
            {enquiry.paymentReferenceId && (
              <div>
                <span className="text-muted-foreground">Ref: </span>
                <span className="text-foreground font-mono text-xs">{enquiry.paymentReferenceId}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

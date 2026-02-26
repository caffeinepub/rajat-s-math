import React, { useState } from 'react';
import { useGetAllEnquiries, useConfirmEnquiry, useRejectEnquiry } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, QrCode } from 'lucide-react';

type EnquiryStatusKey = 'pending' | 'confirmed' | 'rejected';

function getStatusKey(status: any): EnquiryStatusKey {
  if (!status) return 'pending';
  if (typeof status === 'string') return status as EnquiryStatusKey;
  if ('pending' in status) return 'pending';
  if ('confirmed' in status) return 'confirmed';
  if ('rejected' in status) return 'rejected';
  return 'pending';
}

const STATUS_BADGE: Record<EnquiryStatusKey, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function AdminEnquiriesTab() {
  const { data: enquiries = [], isLoading } = useGetAllEnquiries();
  const confirmMutation = useConfirmEnquiry();
  const rejectMutation = useRejectEnquiry();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading enquiries...</div>;
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <QrCode className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No enquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {enquiries.map((enquiry: any) => {
        const statusKey = getStatusKey(enquiry.status);
        const badge = STATUS_BADGE[statusKey];
        const isExpanded = expandedId === enquiry.id;

        return (
          <div key={enquiry.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{enquiry.name}</p>
                  <Badge variant={badge.variant} className="text-xs">
                    {badge.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{enquiry.contactInfo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground font-mono">#{enquiry.id?.slice(0, 8)}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Course Interest: </span>
                    <span className="text-foreground">{enquiry.courseInterest}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact: </span>
                    <span className="text-foreground">{enquiry.contactInfo}</span>
                  </div>
                </div>
                {enquiry.message && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Message:</p>
                    <p className="text-sm text-foreground bg-muted/30 rounded p-2">{enquiry.message}</p>
                  </div>
                )}
                {statusKey === 'confirmed' && enquiry.qrToken && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> QR Token
                    </p>
                    <p className="font-mono text-sm text-foreground break-all">{enquiry.qrToken}</p>
                  </div>
                )}
                {statusKey === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => confirmMutation.mutate(enquiry.id)}
                      disabled={confirmMutation.isPending}
                      className="gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {confirmMutation.isPending ? 'Confirming...' : 'Confirm'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(enquiry.id)}
                      disabled={rejectMutation.isPending}
                      className="gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

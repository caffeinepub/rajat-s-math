import React, { useState } from 'react';
import { useGetEnquiryStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';

type EnquiryStatusKey = 'pending' | 'confirmed' | 'rejected';

function getStatusKey(status: any): EnquiryStatusKey {
  if (!status) return 'pending';
  if (typeof status === 'string') return status as EnquiryStatusKey;
  if ('pending' in status) return 'pending';
  if ('confirmed' in status) return 'confirmed';
  if ('rejected' in status) return 'rejected';
  return 'pending';
}

export default function StudentEnquiryPortal() {
  const [enquiryId, setEnquiryId] = useState('');
  const [enquiry, setEnquiry] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const getEnquiryStatus = useGetEnquiryStatus();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId.trim()) return;

    setNotFound(false);
    setEnquiry(null);

    try {
      const result = await getEnquiryStatus.mutateAsync(enquiryId.trim());
      if (result) {
        setEnquiry(result);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(enquiryId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusKey = enquiry ? getStatusKey(enquiry.status) : null;

  const statusConfig: Record<
    EnquiryStatusKey,
    { icon: React.ReactNode; label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Pending Review',
      color: 'text-amber-600',
      variant: 'secondary',
    },
    confirmed: {
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Confirmed',
      color: 'text-green-600',
      variant: 'default',
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      label: 'Rejected',
      color: 'text-red-600',
      variant: 'destructive',
    },
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Check Enquiry Status</h1>
        <p className="text-muted-foreground text-sm">
          Enter your enquiry ID to check the current status of your application.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Enter your enquiry ID..."
          value={enquiryId}
          onChange={(e) => setEnquiryId(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
        <Button type="submit" disabled={getEnquiryStatus.isPending || !enquiryId.trim()} className="gap-1">
          {getEnquiryStatus.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </Button>
      </form>

      {/* Not found */}
      {notFound && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Enquiry Not Found</p>
            <p className="text-red-600 text-sm mt-1">
              No enquiry found with ID "{enquiryId}". Please check and try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enquiry result */}
      {enquiry && statusKey && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Enquiry Details</CardTitle>
              <Badge variant={statusConfig[statusKey].variant}>
                {statusConfig[statusKey].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status indicator */}
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/30 ${statusConfig[statusKey].color}`}>
              {statusConfig[statusKey].icon}
              <div>
                <p className="font-semibold">{statusConfig[statusKey].label}</p>
                {statusKey === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    Your enquiry is being reviewed. We'll get back to you soon.
                  </p>
                )}
                {statusKey === 'confirmed' && (
                  <p className="text-sm text-muted-foreground">
                    Your enquiry has been confirmed! Check your QR code below.
                  </p>
                )}
                {statusKey === 'rejected' && (
                  <p className="text-sm text-muted-foreground">
                    Unfortunately, your enquiry was not approved at this time.
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{enquiry.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span>{enquiry.contactInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course Interest:</span>
                <span>{enquiry.courseInterest}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Enquiry ID:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">{enquiry.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code for confirmed */}
            {statusKey === 'confirmed' && enquiry.qrToken && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-primary" />
                  Your Check-In QR Code
                </p>
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(enquiry.qrToken)}`}
                    alt="QR Code"
                    className="w-44 h-44 rounded-lg border border-border"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center font-mono break-all">
                  {enquiry.qrToken}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

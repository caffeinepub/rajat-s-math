import React, { useState, useEffect } from 'react';
import { useQRScanner } from '../qr-code/useQRScanner';
import { useValidateQRToken, useConfirmQRCheckIn } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Hash,
} from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'validating' | 'success' | 'error';

type EnquiryStatusKey = 'pending' | 'confirmed' | 'rejected';

function getStatusKey(status: any): EnquiryStatusKey {
  if (!status) return 'pending';
  if (typeof status === 'string') return status as EnquiryStatusKey;
  if ('pending' in status) return 'pending';
  if ('confirmed' in status) return 'confirmed';
  if ('rejected' in status) return 'rejected';
  return 'pending';
}

export default function QRCheckInView() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [manualToken, setManualToken] = useState('');
  const [validatedEnquiry, setValidatedEnquiry] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  const validateToken = useValidateQRToken();
  const confirmCheckIn = useConfirmQRCheckIn();

  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 200,
    maxResults: 3,
  });

  // Process QR scan results
  useEffect(() => {
    if (qrResults.length > 0 && isScanning) {
      const latest = qrResults[0];
      if (latest.data && latest.data !== lastScanned) {
        setLastScanned(latest.data);
        handleValidateToken(latest.data);
      }
    }
  }, [qrResults, isScanning]);

  const handleValidateToken = async (token: string) => {
    if (!token.trim()) return;
    setScanState('validating');
    setErrorMessage('');

    try {
      const result = await validateToken.mutateAsync(token.trim());
      if (result) {
        setValidatedEnquiry(result);
        setScanState('success');
        if (useCamera) {
          await stopScanning();
        }
      } else {
        setErrorMessage('Invalid or expired QR token.');
        setScanState('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Failed to validate token.');
      setScanState('error');
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!validatedEnquiry) return;
    try {
      await confirmCheckIn.mutateAsync(validatedEnquiry.qrToken ?? manualToken);
      setScanState('idle');
      setValidatedEnquiry(null);
      setManualToken('');
      setLastScanned('');
      clearResults();
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Failed to confirm check-in.');
    }
  };

  const handleReset = async () => {
    setScanState('idle');
    setValidatedEnquiry(null);
    setErrorMessage('');
    setManualToken('');
    setLastScanned('');
    clearResults();
    if (isActive) {
      await stopScanning();
    }
    setUseCamera(false);
  };

  const handleStartCamera = async () => {
    setUseCamera(true);
    clearResults();
    setLastScanned('');
    setScanState('scanning');
    await startScanning();
  };

  const statusKey = validatedEnquiry ? getStatusKey(validatedEnquiry.status) : null;

  return (
    <div className="space-y-6 max-w-lg mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR Check-In
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Scan a student's QR code or enter their token manually
        </p>
      </div>

      {/* Camera not supported */}
      {isSupported === false && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center text-amber-700 text-sm">
            Camera is not supported on this device/browser.
          </CardContent>
        </Card>
      )}

      {/* Camera error */}
      {cameraError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center text-red-700 text-sm">
            Camera error: {cameraError.message}
          </CardContent>
        </Card>
      )}

      {/* Success state */}
      {scanState === 'success' && validatedEnquiry && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5" />
              Student Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{validatedEnquiry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-mono text-xs">{validatedEnquiry.id}</span>
              </div>
              {validatedEnquiry.courseInterest && (
                <div className="text-muted-foreground">
                  Course: {validatedEnquiry.courseInterest}
                </div>
              )}
              {statusKey && (
                <Badge
                  variant={
                    statusKey === 'confirmed'
                      ? 'default'
                      : statusKey === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {statusKey}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConfirmCheckIn}
                disabled={confirmCheckIn.isPending}
                className="flex-1 gap-1"
              >
                {confirmCheckIn.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Confirm Check-In
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-1">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {scanState === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <p className="font-medium">Validation Failed</p>
            </div>
            <p className="text-sm text-red-600">{errorMessage}</p>
            <Button variant="outline" onClick={handleReset} size="sm" className="gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validating state */}
      {scanState === 'validating' && (
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validating token...</p>
          </CardContent>
        </Card>
      )}

      {/* Idle / scanning state */}
      {(scanState === 'idle' || scanState === 'scanning') && (
        <div className="space-y-4">
          {/* Camera scanner */}
          {useCamera && (
            <Card>
              <CardContent className="p-3 space-y-3">
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-lg bg-black"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await stopScanning();
                      setUseCamera(false);
                      setScanState('idle');
                    }}
                    className="flex-1"
                  >
                    Stop Camera
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera start button */}
          {!useCamera && isSupported !== false && (
            <Button
              onClick={handleStartCamera}
              disabled={cameraLoading || !canStartScanning}
              variant="outline"
              className="w-full gap-2"
            >
              <Camera className="w-4 h-4" />
              {cameraLoading ? 'Starting Camera...' : 'Scan QR Code with Camera'}
            </Button>
          )}

          {/* Manual entry */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Or enter token manually:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter QR token..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidateToken(manualToken)}
                className="flex-1 font-mono text-sm"
              />
              <Button
                onClick={() => handleValidateToken(manualToken)}
                disabled={!manualToken.trim() || validateToken.isPending}
                className="gap-1"
              >
                {validateToken.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

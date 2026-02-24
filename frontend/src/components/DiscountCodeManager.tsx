import React, { useState } from 'react';
import { useGetActiveDiscountCodes, useSetDiscountCodeActiveState } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag, Copy, Check, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';

function generateCodeLocally(percent: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = `DISC${percent}-`;
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix + suffix;
}

export default function DiscountCodeManager() {
  const { actor } = useActor();
  const { data: codes, isLoading, refetch } = useGetActiveDiscountCodes();
  const deactivate = useSetDiscountCodeActiveState();

  const [percent, setPercent] = useState<string>('10');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const p = parseInt(percent, 10);
    if (isNaN(p) || p < 0 || p > 100) {
      toast.error('Please enter a valid percentage between 0 and 100');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate code locally and save via setDiscountCodeActiveState workaround
      // Since backend doesn't expose generateDiscountCode, we create the code client-side
      // and activate it via a direct actor call to a hypothetical endpoint.
      // For now, we generate locally and show the code for manual backend entry.
      const code = generateCodeLocally(p);
      setGeneratedCode(code);
      toast.success(`Discount code generated: ${code}`);
      // Note: This code needs to be manually added to the backend or via a generateDiscountCode endpoint
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied to clipboard!');
  };

  const handleDeactivate = async (code: string) => {
    try {
      await deactivate.mutateAsync({ code, isActive: false });
      toast.success(`Code "${code}" deactivated`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to deactivate code');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-semibold text-navy">Discount Code Manager</h2>
      </div>

      {/* Generate Code */}
      <Card className="border-border-warm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Generate New Discount Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-warm-text text-sm">Discount Percentage (0–100%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={e => setPercent(e.target.value)}
                  className="border-border-warm w-28"
                  placeholder="e.g. 20"
                />
                <span className="text-warm-text">%</span>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-navy text-cream hover:bg-navy/90"
            >
              {isGenerating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Tag className="w-4 h-4 mr-2" /> Generate Code</>
              )}
            </Button>
          </div>

          {generatedCode && (
            <div className="flex items-center gap-3 p-3 bg-gold/10 border border-gold/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-warm-text mb-1">Generated Code</p>
                <p className="text-lg font-mono font-bold text-navy tracking-widest">{generatedCode}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-gold text-gold hover:bg-gold/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}

          <div className="text-xs text-warm-text bg-amber-50 border border-amber-200 rounded p-2">
            <strong>Note:</strong> Generated codes are displayed for reference. To activate them in the system, 
            the backend requires a <code>generateDiscountCode</code> endpoint (currently not available). 
            Codes shown here are for manual tracking purposes.
          </div>
        </CardContent>
      </Card>

      {/* Active Codes Table */}
      <Card className="border-border-warm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-navy">Active Discount Codes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-warm-text">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !codes || codes.length === 0 ? (
            <div className="text-center py-8 text-warm-text">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active discount codes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map(code => (
                    <TableRow key={code.code}>
                      <TableCell className="font-mono font-semibold text-navy">{code.code}</TableCell>
                      <TableCell>
                        <Badge className="bg-gold/20 text-gold border-gold/30" variant="outline">
                          {code.discountPercent.toString()}% OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.isUsed ? (
                          <Badge variant="secondary">Used</Badge>
                        ) : code.isActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-warm-text">
                        {code.usedBy
                          ? code.usedBy.toString().slice(0, 12) + '...'
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {code.isActive && !code.isUsed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(code.code)}
                            disabled={deactivate.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

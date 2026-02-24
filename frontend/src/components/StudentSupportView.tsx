import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetMySupportMessages, useSubmitSupportMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send, User, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function formatTimestamp(ts: bigint): string {
  try {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown time';
  }
}

interface StudentSupportViewProps {
  studentPrincipal: Principal;
}

export default function StudentSupportView({ studentPrincipal }: StudentSupportViewProps) {
  const [newMessage, setNewMessage] = useState('');

  const { data: messages, isLoading, refetch, isFetching } = useGetMySupportMessages(studentPrincipal);
  const submitMessage = useSubmitSupportMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await submitMessage.mutateAsync(trimmed);
      toast.success('Message sent! The admin will reply soon.');
      setNewMessage('');
      refetch();
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <Card className="border-navy/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-navy font-serif flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold" />
            Support &amp; Messages
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-navy/20 text-navy hover:bg-navy/5 text-xs h-8"
          >
            {isFetching ? (
              <span className="w-3.5 h-3.5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
        <p className="text-warm-text/50 text-xs mt-1">
          Send a message to your instructor. Replies will appear here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center py-8 text-warm-text/40">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-1">Send a message below to get help from your instructor.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-warm-light/60 rounded-lg rounded-tl-none p-3 border border-navy/5">
                      <p className="text-sm text-warm-text">{msg.message}</p>
                    </div>
                    <p className="text-xs text-warm-text/40 mt-1 ml-1">
                      You • {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>

                {msg.reply ? (
                  <div className="flex gap-2 justify-end">
                    <div className="flex-1 min-w-0 max-w-[85%]">
                      <div className="bg-navy/5 rounded-lg rounded-tr-none p-3 border border-navy/10">
                        <p className="text-sm text-navy">{msg.reply}</p>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-warm-text/40">
                          Instructor •{' '}
                          {msg.repliedAt ? formatTimestamp(msg.repliedAt) : 'Replied'}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-gold">R</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-1 text-xs text-amber-600 mr-9">
                      <Clock className="w-3 h-3" />
                      Awaiting reply
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 border-t border-navy/5 pt-4">
          <p className="text-xs font-medium text-navy">Send a new message</p>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Describe your question or issue..."
            className="border-navy/20 focus:ring-gold text-sm min-h-[80px] resize-none"
          />
          <Button
            type="submit"
            disabled={submitMessage.isPending || !newMessage.trim()}
            className="bg-navy hover:bg-navy/90 text-cream text-sm"
          >
            {submitMessage.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

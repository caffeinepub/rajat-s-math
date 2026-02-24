import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { StudentSupportMessage } from '../backend';
import { useGetAllSupportMessages, useReplyToSupportMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  User,
  Send,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
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

function MessageThread({
  studentId,
  messages,
}: {
  studentId: Principal;
  messages: StudentSupportMessage[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const replyMutation = useReplyToSupportMessage();

  const unrepliedCount = messages.filter((m) => !m.reply).length;

  const handleReply = async (messageIndex: number) => {
    const reply = replyTexts[messageIndex]?.trim();
    if (!reply) {
      toast.error('Please enter a reply');
      return;
    }
    try {
      // messageIndex is passed as number — the hook converts to bigint internally
      await replyMutation.mutateAsync({ studentId, messageIndex, reply });
      toast.success('Reply sent');
      setReplyTexts((prev) => ({ ...prev, [messageIndex]: '' }));
    } catch {
      toast.error('Failed to send reply');
    }
  };

  return (
    <Card className="border-navy/10">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-navy" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy truncate">
                {studentId.toString().slice(0, 20)}...
              </p>
              <p className="text-xs text-warm-text/50">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {unrepliedCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {unrepliedCount} pending
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-warm-text/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-warm-text/40" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              {/* Student message */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-warm-light/60 rounded-lg rounded-tl-none p-3 border border-navy/5">
                    <p className="text-sm text-warm-text">{msg.message}</p>
                  </div>
                  <p className="text-xs text-warm-text/40 mt-1 ml-1">
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>

              {/* Admin reply or reply form */}
              {msg.reply ? (
                <div className="flex gap-2 justify-end">
                  <div className="flex-1 min-w-0 max-w-[85%]">
                    <div className="bg-navy/5 rounded-lg rounded-tr-none p-3 border border-navy/10">
                      <p className="text-sm text-navy">{msg.reply}</p>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <p className="text-xs text-warm-text/40">
                        {msg.repliedAt ? formatTimestamp(msg.repliedAt) : 'Replied'}
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">A</span>
                  </div>
                </div>
              ) : (
                <div className="ml-8 space-y-2">
                  <Textarea
                    value={replyTexts[idx] ?? ''}
                    onChange={(e) =>
                      setReplyTexts((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                    placeholder="Type your reply..."
                    className="border-navy/20 focus:ring-gold text-sm min-h-[70px] resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleReply(idx)}
                    disabled={replyMutation.isPending || !replyTexts[idx]?.trim()}
                    className="bg-navy hover:bg-navy/90 text-cream text-xs h-8"
                  >
                    {replyMutation.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        Send Reply
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminSupportMessages() {
  const { data: allMessages, isLoading, refetch, isFetching } = useGetAllSupportMessages();

  const totalPending = allMessages
    ? allMessages.reduce((acc, [, msgs]) => acc + msgs.filter((m) => !m.reply).length, 0)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-navy font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gold" />
            Student Support Messages
          </h2>
          {allMessages && allMessages.length > 0 && (
            <p className="text-xs text-warm-text/50 mt-0.5">
              {allMessages.length} student{allMessages.length !== 1 ? 's' : ''} •{' '}
              {totalPending > 0 ? (
                <span className="text-amber-600 font-medium">
                  {totalPending} pending repl{totalPending !== 1 ? 'ies' : 'y'}
                </span>
              ) : (
                <span className="text-green-600 font-medium">All replied</span>
              )}
            </p>
          )}
        </div>
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !allMessages || allMessages.length === 0 ? (
        <div className="text-center py-16 text-warm-text/40">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No support messages yet</p>
          <p className="text-sm mt-1">Student messages will appear here once they reach out.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMessages.map(([studentId, messages]) => (
            <MessageThread
              key={studentId.toString()}
              studentId={studentId}
              messages={messages}
            />
          ))}
        </div>
      )}
    </div>
  );
}

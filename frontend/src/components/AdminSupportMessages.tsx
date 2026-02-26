import React, { useState } from 'react';
import { useGetAllSupportMessages, useReplyToSupportMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminSupportMessages() {
  const { data: allMessages = [], isLoading } = useGetAllSupportMessages();
  const replyMutation = useReplyToSupportMessage();
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  if (isLoading) {
    return <div className="text-muted-foreground">Loading support messages...</div>;
  }

  if (allMessages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No support messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allMessages.map((studentData: any, studentIndex: number) => {
        const studentId = studentData.studentId ?? studentData.student ?? `student-${studentIndex}`;
        const studentIdStr = typeof studentId === 'object' ? studentId.toString() : String(studentId);
        const messages: any[] = studentData.messages ?? (Array.isArray(studentData) ? studentData : [studentData]);
        const isExpanded = expandedStudent === studentIdStr;
        const unreplied = messages.filter((m: any) => !m.reply).length;

        return (
          <div key={studentIdStr} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedStudent(isExpanded ? null : studentIdStr)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm font-mono truncate">
                    {studentIdStr.slice(0, 20)}...
                  </p>
                  {unreplied > 0 && (
                    <Badge variant="destructive" className="text-xs h-5 px-1.5">
                      {unreplied} new
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{messages.length} message(s)</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {isExpanded && (
              <div className="border-t border-border p-4 space-y-4">
                {messages.map((msg: any, messageIndex: number) => {
                  const replyKey = `${studentIdStr}-${messageIndex}`;
                  return (
                    <div key={messageIndex} className="space-y-2">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-foreground">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {msg.timestamp
                            ? new Date(Number(msg.timestamp) / 1_000_000).toLocaleString()
                            : ''}
                        </p>
                      </div>
                      {msg.reply ? (
                        <div className="bg-primary/5 rounded-lg p-3 ml-4 border-l-2 border-primary">
                          <p className="text-xs text-muted-foreground mb-1">Your reply:</p>
                          <p className="text-sm text-foreground">{msg.reply}</p>
                        </div>
                      ) : (
                        <div className="ml-4 space-y-2">
                          <Textarea
                            placeholder="Type your reply..."
                            value={replyTexts[replyKey] ?? ''}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({ ...prev, [replyKey]: e.target.value }))
                            }
                            className="text-sm min-h-[80px]"
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              const reply = replyTexts[replyKey];
                              if (!reply?.trim()) return;
                              await replyMutation.mutateAsync({
                                studentPrincipal: studentId,
                                messageIndex,
                                reply,
                              });
                              setReplyTexts((prev) => ({ ...prev, [replyKey]: '' }));
                            }}
                            disabled={replyMutation.isPending || !replyTexts[replyKey]?.trim()}
                            className="gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

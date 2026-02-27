import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Send, Loader2, User } from 'lucide-react';
import { useGetAllSupportMessages, useReplyToSupportMessage } from '../hooks/useQueries';

const AdminSupportMessages: React.FC = () => {
  const { data: messages, isLoading } = useGetAllSupportMessages();
  const replyMutation = useReplyToSupportMessage();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleReply = async (studentPrincipal: string, messageIndex: number) => {
    const reply = replies[`${studentPrincipal}-${messageIndex}`];
    if (!reply?.trim()) return;
    await replyMutation.mutateAsync({ studentPrincipal, messageIndex, reply });
    setReplies((prev) => ({ ...prev, [`${studentPrincipal}-${messageIndex}`]: '' }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--navy)' }}
        >
          Support Messages
        </h2>
        <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.03 240)' }}>
          Manage and respond to student support requests
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} />
        </div>
      ) : !messages || (messages as any[]).length === 0 ? (
        <div
          className="rounded-xl bg-white text-center py-16"
          style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
        >
          <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'oklch(0.75 0.02 240)' }} />
          <p className="font-medium" style={{ color: 'var(--navy)' }}>No support messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(messages as any[]).map((thread: any, ti: number) => {
            const studentPrincipal = thread.studentId?.toString() || `thread-${ti}`;
            const isExpanded = expanded === studentPrincipal;
            const threadMessages: any[] = thread.messages || [];

            return (
              <div
                key={studentPrincipal}
                className="rounded-xl bg-white overflow-hidden"
                style={{ boxShadow: 'var(--shadow-md)', border: '1px solid oklch(0.90 0.01 240)' }}
              >
                {/* Thread header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : studentPrincipal)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors duration-150"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'oklch(0.22 0.07 255 / 0.1)' }}
                    >
                      <User size={18} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>
                        Student: {studentPrincipal.slice(0, 20)}...
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.03 240)' }}>
                        {threadMessages.length} message{threadMessages.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} style={{ color: 'oklch(0.60 0.03 240)' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'oklch(0.60 0.03 240)' }} />
                  )}
                </button>

                {/* Thread messages */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5 space-y-4 pt-4" style={{ borderColor: 'oklch(0.90 0.01 240)' }}>
                    {threadMessages.map((msg: any, mi: number) => (
                      <div key={mi} className="space-y-3">
                        {/* Student message */}
                        <div
                          className="rounded-xl p-4"
                          style={{ background: 'var(--cream)', border: '1px solid oklch(0.90 0.01 240)' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold" style={{ color: 'var(--navy)' }}>
                              Student Message
                            </span>
                            <span className="text-xs" style={{ color: 'oklch(0.60 0.03 240)' }}>
                              {msg.timestamp ? new Date(Number(msg.timestamp) / 1_000_000).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'oklch(0.35 0.03 240)' }}>{msg.message}</p>
                        </div>

                        {/* Reply */}
                        {msg.reply ? (
                          <div
                            className="rounded-xl p-4 ml-6"
                            style={{ background: 'oklch(0.22 0.07 255 / 0.05)', border: '1px solid oklch(0.22 0.07 255 / 0.15)' }}
                          >
                            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--gold)' }}>
                              Admin Reply
                            </div>
                            <p className="text-sm" style={{ color: 'oklch(0.35 0.03 240)' }}>{msg.reply}</p>
                          </div>
                        ) : (
                          <div className="ml-6 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your reply..."
                              value={replies[`${studentPrincipal}-${mi}`] || ''}
                              onChange={(e) =>
                                setReplies((prev) => ({ ...prev, [`${studentPrincipal}-${mi}`]: e.target.value }))
                              }
                              className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                              style={{
                                border: '1px solid oklch(0.88 0.015 240)',
                                background: 'white',
                                color: 'var(--navy)',
                                outline: 'none',
                              }}
                              onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
                              onBlur={(e) => { e.target.style.borderColor = 'oklch(0.88 0.015 240)'; }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReply(studentPrincipal, mi);
                              }}
                            />
                            <button
                              onClick={() => handleReply(studentPrincipal, mi)}
                              disabled={replyMutation.isPending}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                              style={{ background: 'var(--navy)', color: 'white' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--navy-light)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--navy)'; }}
                            >
                              {replyMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSupportMessages;

import { supabase } from '@/lib/supabase';
import type { RoutingResult } from '@/types';

// Save a processed email result to the database
export async function saveEmailLog(result: RoutingResult): Promise<void> {
  const { error } = await supabase.from('email_logs').upsert({
    email_id: result.emailId,
    from_address: result.from,
    subject: result.subject,
    body: result.body,
    category: result.category,
    category_label: result.categoryLabel,
    campus_id: result.campusId,
    campus_name: result.campusName,
    agent_name: result.agentName,
    faculty: result.faculty,
    confidence: result.confidence,
    reasoning: result.reasoning,
    draft_reply: result.draftReply,
    status: result.status ?? 'draft',
    escalated: result.escalated ?? false,
    escalation_reason: result.escalationReason ?? null,
    received_at: result.receivedAt,
    processed_at: result.processedAt,
  }, { onConflict: 'email_id' });

  if (error) {
    console.error('[emailStorage] Failed to save email log:', error.message);
  }
}

// Load all email logs (filtered to the logged-in staff's campus by RLS)
export async function loadEmailLogs(): Promise<RoutingResult[]> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('processed_at', { ascending: true });

  if (error) {
    console.error('[emailStorage] Failed to load email logs:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    emailId: row.email_id,
    from: row.from_address,
    subject: row.subject,
    body: row.body,
    category: row.category,
    categoryLabel: row.category_label,
    campusId: row.campus_id,
    campusName: row.campus_name,
    agentName: row.agent_name,
    faculty: row.faculty,
    confidence: row.confidence,
    reasoning: row.reasoning,
    draftReply: row.draft_reply,
    status: row.status as 'draft' | 'sent',
    escalated: row.escalated ?? false,
    escalationReason: row.escalation_reason ?? undefined,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
    processingSteps: [],
  }));
}

// Mark an email as sent in the database
export async function markEmailSent(emailId: string): Promise<void> {
  const { error } = await supabase
    .from('email_logs')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('email_id', emailId);

  if (error) {
    console.error('[emailStorage] Failed to mark email as sent:', error.message);
  }
}

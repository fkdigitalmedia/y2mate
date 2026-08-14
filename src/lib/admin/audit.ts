export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const auditLogsInMemory: AuditLogEntry[] = [];

export async function logAdminAction(
  adminUserId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    adminUserId,
    action,
    resource,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  auditLogsInMemory.unshift(entry);
  if (auditLogsInMemory.length > 200) {
    auditLogsInMemory.pop();
  }

  console.log(`[AUDIT] Admin (${adminUserId}) ${action} on ${resource}${resourceId ? `:${resourceId}` : ''}`);
  return entry;
}

export async function getRecentAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  return auditLogsInMemory.slice(0, limit);
}

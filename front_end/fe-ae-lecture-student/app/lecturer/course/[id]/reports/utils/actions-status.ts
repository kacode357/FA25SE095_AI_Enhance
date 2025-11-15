import { ReportHistoryAction } from '@/types/reports/reports.response';

export function getActionInfo(action?: number | string) {
  // normalize numeric strings
  if (typeof action === 'string' && /^\d+$/.test(action)) {
    action = Number(action);
  }

  if (typeof action === 'number') {
    switch (action) {
      case ReportHistoryAction.Created:
        return { key: 'created', label: 'Created' };
      case ReportHistoryAction.Updated:
        return { key: 'updated', label: 'Updated' };
      case ReportHistoryAction.Submitted:
        return { key: 'submitted', label: 'Submitted' };
      case ReportHistoryAction.Resubmitted:
        return { key: 'resubmitted', label: 'Resubmitted' };
      case ReportHistoryAction.Graded:
        return { key: 'graded', label: 'Graded' };
      case ReportHistoryAction.RevisionRequested:
        return { key: 'revisionrequested', label: 'Revision Requested' };
      case ReportHistoryAction.Rejected:
        return { key: 'rejected', label: 'Rejected' };
      case ReportHistoryAction.StatusChanged:
      default:
        return { key: 'statuschanged', label: 'Status Changed' };
    }
  }

  const s = (action ?? '').toString().toLowerCase();
  if (s.includes('create')) return { key: 'created', label: 'Created' };
  if (s.includes('update')) return { key: 'updated', label: 'Updated' };
  if (s.includes('submit') && s.includes('re')) return { key: 'resubmitted', label: 'Resubmitted' };
  if (s.includes('submit')) return { key: 'submitted', label: 'Submitted' };
  if (s.includes('grade')) return { key: 'graded', label: 'Graded' };
  if (s.includes('revision')) return { key: 'revisionrequested', label: 'Revision Requested' };
  if (s.includes('reject')) return { key: 'rejected', label: 'Rejected' };
  if (s.includes('status')) return { key: 'statuschanged', label: 'Status Changed' };

  return { key: 'unknown', label: (action as string) || 'Action' };
}

export default getActionInfo;

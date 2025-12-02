// components/notifications/notification-routes.ts

export type NotificationEvent =
  | "ReportGraded"
  | "GroupAssignmentAssigned"
  | "GroupLeaderChanged"
  | "GroupMemberAdded"
  | "SupportRequestAccepted"
  | "SupportRequestResolved"
  | "AssignmentClosed";

export type NotificationMetadata = {
  Event?: NotificationEvent | string;
  CourseId?: string;
  GroupId?: string;
  SupportRequestId?: string;
  ConversationId?: string;
  AssignmentId?: string;
  ReportId?: string;
  [key: string]: any;
};

/**
 * Ghi chú title theo Event cho dễ tra.
 * (Hiện tại FE không dùng trực tiếp, nhưng m đã yêu cầu note lại 1 file)
 */
export const NOTIFICATION_EVENT_TITLES: Record<NotificationEvent, string> = {
  ReportGraded: "Report Graded ⭐",
  GroupAssignmentAssigned: "Group Assignment Assigned 📝",
  GroupLeaderChanged: "You're Now Group Leader! 👑",
  GroupMemberAdded: "Added to Group 🎉",
  SupportRequestAccepted: "Support Request In Progress 🔄",
  SupportRequestResolved: "Support Request Resolved ✔️",
  AssignmentClosed: "Assignment Closed 🔒",
};

/**
 * Parse chuỗi metadataJson -> object an toàn
 */
export function parseNotificationMetadata(
  metaJson?: string
): NotificationMetadata | null {
  if (!metaJson) return null;
  try {
    return JSON.parse(metaJson) as NotificationMetadata;
  } catch (error) {
    console.warn("Invalid notification metadataJson:", metaJson, error);
    return null;
  }
}

/**
 * Build href cho 1 notification dựa theo Event + metadataJson
 *
 * Mapping theo yêu cầu:
 *  - ReportGraded
 *      /student/courses/{CourseId}/grades
 *
 *  - GroupAssignmentAssigned
 *      /student/courses/{CourseId}/assignments
 *
 *  - AssignmentClosed
 *      /student/courses/{CourseId}/assignments
 *
 *  - GroupLeaderChanged
 *      /student/courses/{CourseId}/groups/{GroupId} (fallback: /my-groups)
 *
 *  - GroupMemberAdded
 *      /student/courses/{CourseId}/groups/{GroupId} (fallback: /my-groups)
 *
 *  - SupportRequestAccepted
 *      /student/courses/{CourseId}/support/{ConversationId}?requestId={SupportRequestId}
 *      (fallback: /student/courses/{CourseId}/support)
 *
 *  - SupportRequestResolved
 *      /student/courses/{CourseId}/support
 */
export function getNotificationHref(metaJson?: string): string | null {
  const meta = parseNotificationMetadata(metaJson);
  if (!meta) return null;

  const {
    Event,
    CourseId,
    GroupId,
    SupportRequestId,
    ConversationId,
    AssignmentId,
  } = meta;

  if (!Event || !CourseId) return null;

  switch (Event) {
    case "ReportGraded": {
      return `/student/courses/${CourseId}/grades`;
    }

    case "GroupAssignmentAssigned": {
      return `/student/courses/${CourseId}/assignments`;
    }

    case "AssignmentClosed": {
      // Có thể sau này đổi thành /assignments/{AssignmentId} nếu có trang chi tiết
      return `/student/courses/${CourseId}/assignments`;
    }

    case "GroupLeaderChanged": {
      if (GroupId) {
        return `/student/courses/${CourseId}/groups/${GroupId}`;
      }
      return `/student/courses/${CourseId}/my-groups`;
    }

    case "GroupMemberAdded": {
      if (GroupId) {
        return `/student/courses/${CourseId}/groups/${GroupId}`;
      }
      return `/student/courses/${CourseId}/my-groups`;
    }

    case "SupportRequestAccepted": {
      if (ConversationId) {
        const query: string[] = [];

        // BE hiện tại chỉ trả SupportRequestId (không có peerId/peerName)
        if (SupportRequestId) {
          query.push(`requestId=${encodeURIComponent(SupportRequestId)}`);
        }

        const qs = query.length ? `?${query.join("&")}` : "";
        return `/student/courses/${CourseId}/support/${ConversationId}${qs}`;
      }

      return `/student/courses/${CourseId}/support`;
    }

    case "SupportRequestResolved": {
      return `/student/courses/${CourseId}/support`;
    }

    default:
      return null;
  }
}

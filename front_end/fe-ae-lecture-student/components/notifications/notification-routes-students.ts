// components/notifications/notification-routes.ts

export type NotificationEvent =
  | "ReportGraded"
  | "GroupAssignmentAssigned"
  | "GroupLeaderChanged"
  | "GroupMemberAdded"
  | "SupportRequestAccepted"
  | "SupportRequestResolved"
  | "AssignmentClosed"
  | "StudentEnrolled"; // Tao thêm cái này từ JSON của mày

export type NotificationMetadata = {
  Event?: NotificationEvent | string;
  CourseId?: string;
  GroupId?: string;
  SupportRequestId?: string;
  ConversationId?: string;
  AssignmentId?: string;
  ReportId?: string;
  EnrollmentId?: string; // Thêm field này cho đủ bộ
  [key: string]: any;
};

export const NOTIFICATION_EVENT_TITLES: Record<NotificationEvent, string> = {
  ReportGraded: "Report Graded ⭐",
  GroupAssignmentAssigned: "Group Assignment Assigned 📝",
  GroupLeaderChanged: "You're Now Group Leader! 👑",
  GroupMemberAdded: "Added to Group 🎉",
  SupportRequestAccepted: "Support Request In Progress 🔄",
  SupportRequestResolved: "Support Request Resolved ✔️",
  AssignmentClosed: "Assignment Closed 🔒",
  StudentEnrolled: "Enrolled in Course ✅", // Thêm title tương ứng
};

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
      return `/student/courses/${CourseId}/assignments`;
    }

    case "GroupLeaderChanged":
    case "GroupMemberAdded": {
      if (GroupId) {
        return `/student/courses/${CourseId}/groups/${GroupId}`;
      }
      return `/student/courses/${CourseId}/my-groups`;
    }

    // --- Case mày cần check đây ---
    case "SupportRequestAccepted": {
      if (ConversationId) {
        const query: string[] = [];
        if (SupportRequestId) {
          query.push(`requestId=${encodeURIComponent(SupportRequestId)}`);
        }
        const qs = query.length ? `?${query.join("&")}` : "";
        
        // Kết quả sẽ ra: 
        // /student/courses/.../support/...?requestId=...
        return `/student/courses/${CourseId}/support/${ConversationId}${qs}`;
      }
      return `/student/courses/${CourseId}/support`;
    }
    // ------------------------------

    case "SupportRequestResolved": {
      return `/student/courses/${CourseId}/support`;
    }

    // Case mới từ JSON: StudentEnrolled -> Bay thẳng vào trang chủ khóa học
    case "StudentEnrolled": {
        return `/student/courses/${CourseId}`;
    }

    default:
      return null;
  }
}
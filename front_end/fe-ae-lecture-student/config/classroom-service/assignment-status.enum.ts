// config/classroom-service/assignment-status.enum.ts

export enum AssignmentStatus {
  Draft = 1,        // Assignment is in draft state and not yet published
  Scheduled = 2,    // Assignment is scheduled to become active at StartDate
  Active = 3,       // Assignment is currently active and accepting submissions
  Extended = 4,     // Assignment is past due date but within extended due date
  Overdue = 5,      // Assignment is past all due dates
  Closed = 6,       // Assignment has been closed/cancelled by lecturer
  Graded = 7        // Assignment has been graded and cannot be modified
}
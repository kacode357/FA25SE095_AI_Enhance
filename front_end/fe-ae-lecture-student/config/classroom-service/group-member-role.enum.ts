// config/classroom-service/group-member-role.enum.ts

export enum GroupMemberRole {
  /** Regular member with no special privileges */
  Member = 1,

  /** Group leader with coordination responsibilities */
  Leader = 2,

  /** Presenter responsible for presenting work */
  Presenter = 3,

  /** Researcher responsible for research tasks */
  Researcher = 4,

  /** Writer responsible for documentation */
  Writer = 5,
}

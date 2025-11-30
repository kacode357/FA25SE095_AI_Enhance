// config\branding.ts
// Centralized branding & project identity
export const BRAND = {
  shortName: "AIDS-LMS", // acronym option if needed
  productNameEn: "Intelligent Data Collection & Learning Management System",
  productNameVi: "Hệ Thống Thu Thập Dữ Liệu & Quản Lý Học Tập Thông Minh",
  productNameFull: "Intelligent Data Collection and Learning Management System for Digital Marketing Students",

  footerCopyrightHolder: "AIDS-LMS",
  year: 2025,
  taglineEn: "Real-time data ingestion · AI-driven reporting · Adaptive learning",
  taglineVi: "Thu thập dữ liệu thời gian thực · Báo cáo thông minh · Học tập thích ứng",
  missionEn: "Unify data collection, governance and academic performance tracking for modern marketing programs.",
  missionVi: "Hợp nhất thu thập dữ liệu, quản trị và theo dõi hiệu suất học tập cho chương trình marketing hiện đại.",
};

export const CAPABILITIES = [
  { key: "governance", title: "Structured Governance", desc: "Role matrices & granular access alignment" },
  { key: "insight", title: "Actionable Insights", desc: "Auto-generated performance & campaign trends" },
  { key: "monitor", title: "Real-time Monitoring", desc: "Stream ingestion health & anomaly flags" },
  { key: "scaling", title: "Elastic Scaling", desc: "Adaptive resource & quota optimization" },
] as const;


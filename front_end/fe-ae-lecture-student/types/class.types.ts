export type ClassStatus = "active" | "archived";

export type ClassItem = {
  id: string;
  code: string;
  name: string;
  semester: string;
  students: number;
  status: ClassStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export type FormState = {
  code: string;
  name: string;
  semester: string;
  status?: ClassStatus;
};

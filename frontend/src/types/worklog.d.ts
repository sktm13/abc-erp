export type WorkLogStatus = "WORKING" | "COMPLETED";

export interface WorkLog {
  id: number;
  employeeNo: string;
  name: string;
  department: string;
  workDate: string;
  startTime: string;
  endTime: string | null;
  workMinutes: number | null;
  workHours: number | null;
  content: string | null;
  status: WorkLogStatus;
}

export interface WorkLogCurrent {
  working: boolean;
  workLogId: number | null;
  startTime: string | null;
}

export interface WorkLogEndRequest {
  content: string;
}
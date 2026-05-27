import jwtAxios from "./jwtAxios";
import type {
  WorkLog,
  WorkLogCurrent,
  WorkLogEndRequest,
} from "../types/worklog";

export const getCurrentWorkStatus = async (): Promise<WorkLogCurrent> => {
  const res = await jwtAxios.get("/api/worklogs/current");

  return res.data;
};

export const startWork = async (): Promise<WorkLogCurrent> => {
  const res = await jwtAxios.post("/api/worklogs/start");

  return res.data;
};

export const endWork = async (
  data: WorkLogEndRequest
): Promise<WorkLog> => {
  const res = await jwtAxios.post("/api/worklogs/end", data);

  return res.data;
};

export const getMyWorkLogs = async (
  year: number,
  month: number
): Promise<WorkLog[]> => {
  const res = await jwtAxios.get("/api/worklogs/me", {
    params: {
      year,
      month,
    },
  });

  return res.data;
};
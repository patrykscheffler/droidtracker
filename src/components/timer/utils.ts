import type { Project, Task, TimeLog } from "@prisma/client";
import { format } from "date-fns";

export type TimeLogWithIncludes = TimeLog & {
  project: Project | null;
  task: Task | null;
  user?: {
    id: string | null;
    name: string | null;
  } | null;
  subRows?: TimeLogWithIncludes[];
};

export function groupTimeLogsByDate(timeLogs: TimeLogWithIncludes[]) {
  const groupedTimeLogs = timeLogs.reduce<{ [key: string]: TimeLog[] }>(
    (result, timeLog) => {
      const dayKey = format(timeLog.start, "LLL dd, y");

      return {
        ...result,
        [dayKey]: [...(result[dayKey] || []), timeLog],
      };
    },
    {}
  );

  const groupedTimeLogsArray = Object.keys(groupedTimeLogs).map((key) => {
    const timeLogs = (groupedTimeLogs[key] ?? []) as TimeLogWithIncludes[];
    const duration = timeLogs.reduce(
      (totalDuration, timeLog) => (timeLog.duration ?? 0) + totalDuration,
      0
    );

    return {
      date: key,
      duration,
      timeLogs,
    };
  });

  return groupedTimeLogsArray;
}

export function groupTimeLogsByTask(timeLogs: TimeLogWithIncludes[]) {
  const groupedTimeLogs = timeLogs.reduce<{ [key: string]: TimeLog[] }>(
    (result, timeLog) => {
      if (!timeLog.userId) return result;
      const key = `${timeLog.taskId || "null"}-${timeLog.userId}`;

      return {
        ...result,
        [key]: [...(result[key] || []), timeLog],
      };
    },
    {}
  );

  const groupedTimeLogsArray = Object.keys(groupedTimeLogs).map((key) => {
    const timeLogs = (groupedTimeLogs[key] ?? []) as TimeLogWithIncludes[];
    if (timeLogs.length === 1) return timeLogs[0];
    if (!timeLogs?.length) return;

    const billable = timeLogs.every((timeLog) => timeLog.billable);
    const duration = timeLogs.reduce(
      (totalDuration, timeLog) => (timeLog.duration ?? 0) + totalDuration,
      0
    );

    const { project, task, user } = timeLogs[0] || {};

    return {
      project,
      task,
      user,
      subRows: timeLogs,
      duration,
      billable,
    };
  }) as TimeLogWithIncludes[];

  return groupedTimeLogsArray;
}

export function groupTimeLogs(timeLogs: TimeLogWithIncludes[]) {
  return groupTimeLogsByDate(timeLogs).map((dayTimeLogs) => ({
    date: dayTimeLogs.date,
    duration: dayTimeLogs.duration,
    timeLogs: groupTimeLogsByTask(dayTimeLogs.timeLogs),
  }));
}

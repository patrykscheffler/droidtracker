import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { type DateRange } from "react-day-picker";
import type { Project, TimeLog, Task } from "@prisma/client";

import { DatePickerWithRange } from "../ui/DatePickerWithRange";
import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { formatDuration, stringToHSLColor } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type TimeLogWithIncludes = TimeLog & {
  project: Project | null;
  task: Task | null;
};

function groupTimeLogs(timeLogs: TimeLogWithIncludes[]) {
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

function timeLogsProjects(
  timeLogs: TimeLogWithIncludes[],
  totalDuration: number
) {
  const groupedTimeLogs = timeLogs.reduce<{ [key: string]: TimeLog[] }>(
    (result, timeLog) => {
      const project = timeLog.project?.name ?? "";

      return {
        ...result,
        [project]: [...(result[project] || []), timeLog],
      };
    },
    {}
  );

  const projects = Object.keys(groupedTimeLogs)
    .map((key) => {
      const duration = (groupedTimeLogs[key] ?? []).reduce(
        (totalDuration, timeLog) => (timeLog.duration ?? 0) + totalDuration,
        0
      );
      const percentage = Math.floor((duration / totalDuration) * 100);
      const color = stringToHSLColor(key);

      return {
        name: key,
        color,
        duration,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return projects;
}

export default function TimeLogs() {
  const utils = api.useContext();

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const today = new Date();
      const from = startOfWeek(today);
      const to = endOfWeek(today);

      return {
        from,
        to,
      };
    }
  );

  const { mutate } = api.timeLog.update.useMutation({
    onSuccess: async () => {
      await utils.timeLog.get.invalidate();
    },
  });
  const { data: timeLogs = [] } = api.timeLog.get.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    {
      enabled: !!dateRange,
    }
  );
  const groupedTimeLogs = React.useMemo(
    () => groupTimeLogs(timeLogs),
    [timeLogs]
  );
  const duration = React.useMemo(
    () =>
      timeLogs.reduce(
        (totalDuration, timeLog) => (timeLog.duration ?? 0) + totalDuration,
        0
      ),
    [timeLogs]
  );
  const projects = React.useMemo(
    () => timeLogsProjects(timeLogs, duration),
    [timeLogs, duration]
  );

  const columns: ColumnDef<TimeLogWithIncludes>[] = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.task?.name,
        header: "Task",
      },
      {
        accessorFn: (row) => row.project?.name,
        header: "Project",
      },
      {
        accessorFn: (row) => row.duration,
        header: "Entry",
        size: 250,
        cell: ({ row }) => {
          if (!row.original) return;
          const { start, end, duration } = row.original;

          return (
            <div className="flex gap-2" key={row.original.id}>
              <DatePickerWithTimeRange
                start={start}
                end={end}
                onUpdate={(timeLog) =>
                  mutate({ ...timeLog, id: row.original.id })
                }
              />
              <DurationInput
                duration={duration}
                onUpdate={(duration) =>
                  mutate({ duration, id: row.original.id })
                }
              />
            </div>
          );
        },
      },
    ],
    [mutate]
  );

  return (
    <div className="flex flex-col gap-5">
      <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Projects</CardTitle>
          <span className="text-xl font-medium">
            {formatDuration(duration)}
          </span>
        </CardHeader>
        <CardContent className="flex flex-nowrap gap-2">
          {projects.map((project) => (
            <div key={project.name} style={{ flexGrow: project.percentage }}>
              <p className="text-2xl font-bold">{project.percentage}%</p>
              <p className="text-xs text-muted-foreground">{project.name}</p>
              <div
                className="mt-2 h-1 w-full rounded"
                style={{ backgroundColor: project.color }}
              ></div>
            </div>
          ))}
        </CardContent>
      </Card>
      {groupedTimeLogs.map((group) => (
        <Card key={group.date}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">{group.date}</CardTitle>
            <span className="text-xl font-medium">
              {formatDuration(group.duration)}
            </span>
          </CardHeader>

          <CardContent>
            <DataTable key={group.date} columns={columns} data={group.timeLogs} />
          </CardContent>

        </Card>
      ))}
    </div>
  );
}

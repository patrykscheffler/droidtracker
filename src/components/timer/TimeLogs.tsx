import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { type DateRange } from "react-day-picker";
import type { Project, TimeLog, Task } from "@prisma/client";

import { DatePickerWithRange } from "../ui/DatePickerWithRange";
import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { formatDuration } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";

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
        cell: ({ row }) => {
          if (!row.original) return;
          const { start, end, duration } = row.original;

          return (
            <div className="flex gap-2" key={row.original.id}>
              <DurationInput
                duration={duration}
                onUpdate={(duration) =>
                  mutate({ duration, id: row.original.id })
                }
              />
              <DatePickerWithTimeRange
                start={start}
                end={end}
                onUpdate={(timeLog) =>
                  mutate({ ...timeLog, id: row.original.id })
                }
              />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-2">
      <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
      {groupedTimeLogs.map((group) => (
        <>
          <div className="mt-2 flex justify-between">
            <h2 className="text-xl font-bold">{group.date}</h2>
            <h2 className="text-xl font-bold">
              {formatDuration(group.duration)}
            </h2>
          </div>

          <DataTable key={group.date} columns={columns} data={group.timeLogs} />
        </>
      ))}
    </div>
  );
}

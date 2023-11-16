import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { type DateRange } from "react-day-picker";
import type { Project, TimeLog, Task } from "@prisma/client";

import { DatePickerWithRange } from "../ui/DatePickerWithRange";
import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { cn, formatDuration } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DollarSign } from "lucide-react";
import { Button } from "../ui/Button";

type TimeLogWithIncludes = TimeLog & {
  project: Project | null;
  task: Task | null;
  user: {
    id: string | null;
    name: string | null;
  } | null;
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

type Props = {
  projectId: string;
};

export default function ProjectActivity({ projectId }: Props) {
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
      await utils.timeLog.projectTimeLogs.invalidate();
    },
  });
  const { data: timeLogs = [] } = api.timeLog.projectTimeLogs.useQuery(
    {
      projectId,
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
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorFn: (row) => row.user?.name,
        header: "User",
      },
      {
        accessorKey: "billable",
        header: "Rate",
        size: 40,
        cell: ({ row }) => {
          if (!row.original) return;

          return (
            <Button
              size="sm"
              variant="ghost"
              className="h-auto"
              onClick={() => {
                mutate({
                  billable: !row.original.billable,
                  id: row.original.id,
                });
              }}
            >
              <DollarSign
                size={16}
                className={cn(
                  row.original.billable ? "opacity-100" : "opacity-30"
                )}
              />
            </Button>
          );
        },
      },
      {
        accessorKey: "duration",
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

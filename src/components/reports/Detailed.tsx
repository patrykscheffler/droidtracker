import React from "react";
import { DollarSign } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { ColumnDef } from "@tanstack/react-table";
import type { Project, Task, TimeLog } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { api } from "~/utils/api";
import { cn, formatDuration } from "~/lib/utils";
import { DataTable } from "../ui/DataTable";
import { Button } from "../ui/Button";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";

type TimeLogWithIncludes = TimeLog & {
  project: Project | null;
  task: Task | null;
  user: {
    id: string | null;
    name: string | null;
  } | null;
};

type Props = {
  dateRange?: DateRange;
  projects?: string[];
  team?: string[];
  billable?: boolean;
};

export default function ReportsDetailed({
  dateRange,
  projects,
  team,
  billable,
}: Props) {
  const utils = api.useContext();

  const { mutate } = api.timeLog.update.useMutation({
    onSuccess: async () => {
      await utils.timeLog.projectTimeLogs.invalidate();
    },
  });
  const { data: timeLogs = [] } = api.timeLog.projectTimeLogs.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
      projects,
      team,
      billable,
    },
    {
      enabled: !!dateRange,
    }
  );
  const { data: duration } = api.timeLog.projectDuration.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
      projects,
      team,
      billable,
    },
    {
      enabled: !!dateRange,
    }
  );

  const columns: ColumnDef<TimeLogWithIncludes>[] = React.useMemo(
    () => [
      {
        accessorFn: (row) => row.task?.name,
        header: "Task",
        cell: ({ row }) => (
          <div className="flex">
            <span className="font-medium">{row.original?.task?.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="flex">
            <span className="max-w-[500px] truncate">
              {row.getValue("description")}
            </span>
          </div>
        ),
      },
      {
        accessorFn: (row) => row.project?.name,
        header: "Project",
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Total time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(duration?.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Billable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(duration?.billable)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Nonbillable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(duration?.nonbillable)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium"></CardTitle>
          <span className="text-xl font-medium">
            {/* {formatDuration(timeLogsDuration)} */}
          </span>
        </CardHeader>

        <CardContent>
          <DataTable columns={columns} data={timeLogs} />
        </CardContent>
      </Card>
    </div>
  );
}

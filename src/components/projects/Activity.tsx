import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { type DateRange } from "react-day-picker";
import { DollarSign } from "lucide-react";
import Link from "next/link";

import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { cn, formatDuration } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { type TimeLogWithIncludes, groupTimeLogs } from "../timer/utils";
import Mattermost from "../ui/icons/Mattermost";
import { env } from "~/env.mjs";

type Props = {
  projectId: string;
  dateRange?: DateRange;
};

export default function ProjectActivity({ projectId, dateRange }: Props) {
  const utils = api.useContext();

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
        cell: ({ row }) => (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${row.depth * 2}rem` }}
          >
            {!row.depth && (
              <Link
                target="_blank"
                href={`${env.NEXT_PUBLIC_MATTERMOST_URL ?? ""}/boards/team/${
                  env.NEXT_PUBLIC_MATTERMOST_TEAM ?? ""
                }/${row.original.project?.externalId ?? ""}/0/${
                  row.original.task?.externalId ?? ""
                }`}
              >
                <Mattermost className="mr-2 h-5 w-5" />
              </Link>
            )}
            {row.getCanExpand() && (
              <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  className: cn(
                    "rounded border px-2 py-0.5 mr-2",
                    row.getIsExpanded() ? "bg-slate-200" : "bg-transparent"
                  ),
                }}
              >
                {row.subRows.length}
              </button>
            )}{" "}
            <span className="font-medium">{row.original?.task?.name}</span>
            <span className="ml-2 max-w-[500px] truncate font-light">
              {row.original?.description}
            </span>
          </div>
        ),
      },
      {
        accessorFn: (row) => row.user?.name ?? "",
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
                if (row.getCanExpand()) {
                  row.subRows.map((subRow) =>
                    mutate({
                      billable: !row.original.billable,
                      id: subRow.original.id,
                    })
                  );
                } else {
                  mutate({
                    billable: !row.original.billable,
                    id: row.original.id,
                  });
                }
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
                disabled={row.getCanExpand()}
                start={start}
                end={end}
                onUpdate={(timeLog) =>
                  mutate({ ...timeLog, id: row.original.id })
                }
              />
              <DurationInput
                disabled={row.getCanExpand()}
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
      {groupedTimeLogs.map((group) => (
        <Card key={group.date}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">{group.date}</CardTitle>
            <span className="text-xl font-medium">
              {formatDuration(group.duration)}
            </span>
          </CardHeader>

          <CardContent>
            <DataTable
              key={group.date}
              columns={columns}
              data={group.timeLogs}
              getSubRows={(row) => row.subRows}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { type DateRange } from "react-day-picker";
import type { TimeLog } from "@prisma/client";
import Link from "next/link";

import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { cn, formatDuration, stringToHSLColor } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { groupTimeLogs, type TimeLogWithIncludes } from "./utils";
import Mattermost from "../ui/icons/Mattermost";
import { env } from "~/env.mjs";

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

type Props = {
  dateRange?: DateRange;
  userId?: string;
};

export default function TimeLogs({ dateRange, userId }: Props) {
  const utils = api.useContext();

  const { mutate } = api.timeLog.update.useMutation({
    onSuccess: async () => {
      await utils.timeLog.get.invalidate();
    },
  });
  const { data: timeLogs = [] } = api.timeLog.get.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
      userId,
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
        accessorFn: (row) => row.project?.name,
        header: "Project",
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

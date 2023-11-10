import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { type DateRange } from "react-day-picker";
import type { TimeCard } from "@prisma/client";

import { DatePickerWithRange } from "../ui/DatePickerWithRange";
import { DataTable } from "~/components/ui/DataTable";
import { api } from "~/utils/api";
import { formatDuration } from "~/lib/utils";
import { DatePickerWithTimeRange } from "../ui/DatePickerWithTimeRange";
import { DurationInput } from "../ui/DurationInput";

export default function TimeCards() {
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

  const { mutate } = api.timeCard.update.useMutation({
    onSuccess: async () => {
      await utils.timeCard.get.invalidate();
    },
  });
  const { data: timeCards = [] } = api.timeCard.get.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    {
      enabled: !!dateRange,
    }
  );
  const duration = React.useMemo(
    () =>
      timeCards.reduce(
        (totalDuration, timeCard) => (timeCard.duration ?? 0) + totalDuration,
        0
      ),
    [timeCards]
  );

  const columns: ColumnDef<TimeCard>[] = React.useMemo(
    () => [
      {
        accessorKey: "start",
        header: "Date",
        cell: ({ row }) => (
          <p className="text-sm text-muted-foreground">
            {format(row.original.start, "dd MMM yyyy")}
          </p>
        ),
      },
      {
        accessorKey: "duration",
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
                onUpdate={(timeCard) =>
                  mutate({ ...timeCard, id: row.original.id })
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
    <div className="flex flex-col gap-2">
      <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
      <div className="mt-2 flex">
        <h2 className="text-xl font-bold">{formatDuration(duration)}</h2>
      </div>

      <DataTable columns={columns} data={timeCards} />
    </div>
  );
}

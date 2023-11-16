import React from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { type DateRange } from "react-day-picker";

import { DatePickerWithRange } from "../ui/DatePickerWithRange";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Download, Save } from "lucide-react";
import { Filter } from "./Filter";
import { api } from "~/utils/api";
import { formatDuration } from "~/lib/utils";

const projects = [
  {
    value: "project1",
    label: "Project 1",
  },
  {
    value: "project2",
    label: "Project 2",
  },
  {
    value: "project3",
    label: "Project 3",
  },
]

export default function ReportsSummary() {
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

  const { data: duration } = api.timeLog.projectDuration.useQuery(
    {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    {
      enabled: !!dateRange,
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <Filter title="Project" options={projects} />
        </div>
        <div className="flex gap-2">
          <Button><Save className="mr-2 h-4 w-4" /> Save report</Button>
          <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Total time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(duration?.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Billable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(duration?.billable)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Nonbillable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(duration?.nonbillable)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

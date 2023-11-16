import React from "react";
import type { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { api } from "~/utils/api";
import { formatDuration } from "~/lib/utils";

type Props = {
  dateRange?: DateRange;
};

export default function ReportsSummary({ dateRange }: Props) {
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

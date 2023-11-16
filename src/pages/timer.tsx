import React from "react";
import type { DateRange } from "react-day-picker";
import { endOfWeek, startOfWeek } from "date-fns";

import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import TimeLogs from "~/components/timer/TimeLogs";
import TimeCards from "~/components/timer/TimeCards";
import { DatePickerWithRange } from "~/components/ui/DatePickerWithRange";

const TimerPage = () => {
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

  return (
    <>
      <Meta title="Timer" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Timer</h2>
        </div>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="timelogs">
        <TabsList>
          <TabsTrigger value="timelogs">TimeLogs</TabsTrigger>
          <TabsTrigger value="timecards">TimeCards</TabsTrigger>
        </TabsList>
        <TabsContent value="timelogs" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <TimeLogs dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="timecards" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <TimeCards dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

TimerPage.getLayout = getLayout;

export default TimerPage;

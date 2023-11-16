import React from "react";
import type { DateRange } from "react-day-picker";
import { Download, Save } from "lucide-react";
import { endOfWeek, startOfWeek } from "date-fns";

import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import ReportsSummary from "~/components/reports/Summary";
import { DatePickerWithRange } from "~/components/ui/DatePickerWithRange";
import { Filter } from "~/components/reports/Filter";
import { Button } from "~/components/ui/Button";
import ReportsDetailed from "~/components/reports/Detailed";

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
];

const ReportsPage = () => {
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

  const header = (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
        <Filter title="Project" options={projects} />
      </div>
      <div className="flex gap-2">
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save report
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Meta title="Timer" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        </div>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger disabled value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          {header}
          <ReportsSummary dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          {header}
          <ReportsDetailed dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

ReportsPage.getLayout = getLayout;

export default ReportsPage;

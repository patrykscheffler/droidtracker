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
import { api } from "~/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";

const ReportsPage = () => {
  const [billable, setBillable] = React.useState("");
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<string[]>([]);
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
  console.log(dateRange);

  const { data: projects = [] } = api.project.getAll.useQuery();
  const projectOptions = React.useMemo(
    () =>
      projects?.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects]
  );

  const { data: team = [] } = api.user.users.useQuery();
  const teamOptions = React.useMemo(
    () =>
      team?.map((user) => ({
        value: user.id,
        label: user.name || user.email || user.id,
      })),
    [team]
  );

  const billableValue =
    billable === "billable"
      ? true
      : billable === "nonbillable"
      ? false
      : undefined;

  const header = (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
        <Filter
          title="Project"
          options={projectOptions}
          value={selectedProjects}
          onChange={setSelectedProjects}
        />
        <Filter
          title="Team"
          options={teamOptions}
          value={selectedTeam}
          onChange={setSelectedTeam}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-dashed">
              Billable
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={billable}
              onValueChange={setBillable}
            >
              <DropdownMenuRadioItem value="">Both</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="billable">
                Billable
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="nonbillable">
                Nonbillable
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-2">
        <Button disabled>
          <Save className="mr-2 h-4 w-4" /> Save report
        </Button>
        <Button disabled>
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
          <TabsTrigger disabled value="saved">
            Saved
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          {header}
          <ReportsSummary
            dateRange={dateRange}
            projects={selectedProjects}
            team={selectedTeam}
            billable={billableValue}
          />
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          {header}
          <ReportsDetailed
            dateRange={dateRange}
            projects={selectedProjects}
            team={selectedTeam}
            billable={billableValue}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

ReportsPage.getLayout = getLayout;

export default ReportsPage;

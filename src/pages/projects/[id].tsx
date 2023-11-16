import React from "react";
import { useRouter } from "next/router";
import { type DateRange } from "react-day-picker";
import { endOfWeek, startOfWeek } from "date-fns";

import Meta from "~/components/ui/Meta";
import { getLayout } from "~/components/layouts/AppLayout";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import { api } from "~/utils/api";
import ProjectDashboard from "~/components/projects/Dashboard";
import ProjectActivity from "~/components/projects/Activity";
import { DatePickerWithRange } from "~/components/ui/DatePickerWithRange";

const ProjectPage = () => {
  const router = useRouter();
  const { id } = router.query;

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

  const { data: project } = api.project.get.useQuery(id as string);

  if (!project) return null;

  return (
    <>
      <Meta title="Timer" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h2>
        </div>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger disabled value="task">
            Tasks
          </TabsTrigger>
          <TabsTrigger disabled value="team">
            Team
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <ProjectDashboard projectId={id as string} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <ProjectActivity projectId={id as string} dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

ProjectPage.getLayout = getLayout;

export default ProjectPage;

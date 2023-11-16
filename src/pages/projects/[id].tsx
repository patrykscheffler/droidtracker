import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import TimeLogs from "~/components/timer/TimeLogs";
import TimeCards from "~/components/timer/TimeCards";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Home = () => {
  const router = useRouter();
  const { id } = router.query;

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
      <Tabs defaultValue="timelogs">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger disabled value="task">
            Tasks
          </TabsTrigger>
          <TabsTrigger disabled value="timecards">
            Team
          </TabsTrigger>
          <TabsTrigger value="timecards">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="timelogs" className="space-y-4">
          <TimeLogs />
        </TabsContent>
        <TabsContent value="timecards" className="space-y-4">
          <TimeCards />
        </TabsContent>
      </Tabs>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import TimeLogs from "~/components/timer/TimeLogs";

const Home = () => {
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
          <TimeLogs />
        </TabsContent>
      </Tabs>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

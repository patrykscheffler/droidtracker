import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/Tabs";

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
      <Tabs defaultValue="timelogs" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="timelogs">Timelogs</TabsTrigger>
          <TabsTrigger value="timecards">Timecards</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

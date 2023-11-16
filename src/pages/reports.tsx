import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import ReportsSummary from "~/components/reports/Summary";

const Home = () => {
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
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          <ReportsSummary />
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          <ReportsSummary />
        </TabsContent>
      </Tabs>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

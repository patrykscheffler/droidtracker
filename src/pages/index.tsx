import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";

const Home = () => {
  return (
    <>
      <Meta title="Dashboard" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          {/* <p className="text-sm text-slate-500 dark:text-slate-400">
            Description
          </p> */}
        </div>
      </div>
      <Separator className="my-4" />
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

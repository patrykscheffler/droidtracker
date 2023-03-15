import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/Tabs";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        </div>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

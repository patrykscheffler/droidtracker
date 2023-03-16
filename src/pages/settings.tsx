import { getLayout } from "~/components/layouts/AppLayout";
import ProfileSettings from "~/components/settings/Profile";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-2xl">

        <ProfileSettings />

        <div className="mt-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your work schedule
            </p>
          </div>
        </div>
        <Separator className="my-4" />
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

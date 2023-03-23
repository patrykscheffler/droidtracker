import { getLayout } from "~/components/layouts/AppLayout";
import ProfileSettings from "~/components/settings/Profile";
import ProfileSchedule from "~/components/settings/Schedule";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-2xl">

        <ProfileSettings />

        <ProfileSchedule />
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

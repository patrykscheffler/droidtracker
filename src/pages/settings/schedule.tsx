import { getLayout } from "~/components/layouts/AppLayout";
import ProfileSchedule from "~/components/settings/Schedule";
import Meta from "~/components/ui/Meta";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-2xl">
        <ProfileSchedule />
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

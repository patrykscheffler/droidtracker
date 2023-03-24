import { getLayout } from "~/components/layouts/AppLayout";
import ProfileSettings from "~/components/settings/Profile";
import Meta from "~/components/ui/Meta";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-2xl">
        <ProfileSettings />
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

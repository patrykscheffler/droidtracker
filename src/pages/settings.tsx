import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";

const SettingsView = () => {
  return (
    <>
      <Meta title="Settings" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl">
          Settings page
        </p>
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

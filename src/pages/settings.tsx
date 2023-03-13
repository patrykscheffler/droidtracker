import { getLayout } from "~/components/layouts/AppLayout";

const SettingsView = () => {
  return (
    <>
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

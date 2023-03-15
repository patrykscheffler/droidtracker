import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";

const AvailabilityView = () => {
  return (
    <>
      <Meta title="Availability" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl">
          Availability page
        </p>
      </div>
    </>
  );
};

AvailabilityView.getLayout = getLayout;

export default AvailabilityView;

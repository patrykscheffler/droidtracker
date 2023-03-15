import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";

const AvailabilityView = () => {
  return (
    <>
      <Meta title="Availability" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Availability</h2>
        </div>
      </div>
      <Separator className="my-4" />
    </>
  );
};

AvailabilityView.getLayout = getLayout;

export default AvailabilityView;

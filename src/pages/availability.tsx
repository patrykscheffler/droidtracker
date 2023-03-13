import { getLayout } from "~/components/layouts/AppLayout";

const AvailabilityView = () => {
  return (
    <>
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

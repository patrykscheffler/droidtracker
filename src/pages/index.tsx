import { getLayout } from "~/components/layouts/AppLayout";

const Home = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl">
          Home page
        </p>
      </div>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

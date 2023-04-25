import { getLayout } from "~/components/layouts/AppLayout";
import { Button } from "~/components/ui/Button";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";

import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

const Home = () => {
  const { data: users } = api.user.users.useQuery();

  return (
    <>
      <Meta title="Dashboard" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center gap-2">
        {users?.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border border-gray-200">
            <div className="flex flex-col items-center gap-2 p-5">
              <div
                className="relative mr-2 h-12 w-12 flex-shrink-0 rounded-full bg-gray-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="rounded-full"
                  src={`/${user.id}/avatar.png`}
                  alt=""
                />
                <div
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                    user.timeCards[0]?.end === null
                      ? "bg-green-500"
                      : "bg-red-500"
                  )}
                />
              </div>
              <h3 className="mb-1 text-xl font-medium text-gray-900">{user.name}</h3>
              {/* <span>Clocked in at: {format(user.timeCards?.[0]?.start, "H")}</span> */}
              <Button variant="outline" href={`/${user.id}/chat`}>Message</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

Home.getLayout = getLayout;

export default Home;

import { MoreHorizontal, Send } from "lucide-react";

import { getLayout } from "~/components/layouts/AppLayout";
import { ButtonGroup } from "~/components/ui/ButtonGroup";
import { Separator } from "~/components/ui/Separator";
import { Button } from "~/components/ui/Button";
import Meta from "~/components/ui/Meta";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";

const TeamView = () => {
  const { data: users } = api.user.users.useQuery();

  return (
    <>
      <Meta title="Team" />
      <div className="mx-auto max-w-3xl">
        <div className="mt-2 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          </div>
        </div>
        <Separator className="my-4" />

        {users && (
          <div className="mb-16 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            {users?.map((user) => (
              <div
                key={user.id}
                className="group flex w-full max-w-full items-center justify-between overflow-hidden border-b border-gray-200 px-4 py-4 last:border-0 hover:bg-gray-50 sm:px-6"
              >
                <div className="flex justify-center items-center">
                  <div
                    key={user.id}
                    className="relative mr-2 h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
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
                  <div className="flex flex-col ml-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {user.name}
                  </span>
                  <span className="text-xs">
                    {user.email}
                  </span>
                  </div>
                </div>
                <div>
                  <ButtonGroup combined>
                    <Button href={`/${user.id}/chat`} variant="icon" size="sm">
                      <Send size="1rem" />
                    </Button>
                    <Button variant="icon" size="sm">
                      <MoreHorizontal size="1rem" />
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

TeamView.getLayout = getLayout;

export default TeamView;

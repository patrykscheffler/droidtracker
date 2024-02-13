import { MoreHorizontal, Send } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";

import { getLayout } from "~/components/layouts/AppLayout";
import { ButtonGroup } from "~/components/ui/ButtonGroup";
import { Separator } from "~/components/ui/Separator";
import { Button } from "~/components/ui/Button";
import Meta from "~/components/ui/Meta";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { useToast } from "~/lib/hooks/useToast";

const TeamView = () => {
  const router = useRouter();
  const utils = api.useContext();
  const { toast } = useToast();
  const { data: me } = api.user.me.useQuery();
  const { data: users } = api.user.users.useQuery();
  const { mutate: blockUser } = api.user.blockUser.useMutation({
    onSuccess: async () => {
      toast({ title: "User blocked", variant: "success" });
      await utils.user.users.invalidate();
    },
  });

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
                onClick={() => router.push(`/team/${user.id}`)}
                className="group flex w-full max-w-full cursor-pointer items-center justify-between overflow-hidden border-b border-gray-200 px-4 py-4 last:border-0 hover:bg-gray-50 sm:px-6"
              >
                <div className="flex items-center justify-center">
                  <div
                    key={user.id}
                    className="relative mr-2 h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                  >
                    <Image
                      className="rounded-full"
                      src={`/${user.id}/avatar.png`}
                      width={40}
                      height={40}
                      alt="User profile picture"
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
                  <div className="ml-2 flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      {user.name}
                    </span>
                    <span className="text-xs">{user.email}</span>
                  </div>
                </div>
                <div>
                  <ButtonGroup combined>
                    <Button href={`/${user.id}/chat`} variant="icon" size="sm">
                      <Send size="1rem" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="icon" size="sm">
                          <MoreHorizontal size="1rem" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          disabled={user.id === me?.id}
                          onClick={() => blockUser({ userId: user.id })}
                        >
                          Block
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

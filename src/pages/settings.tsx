import { getLayout } from "~/components/layouts/AppLayout";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Label } from "~/components/ui/Label";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import { env } from "~/env.mjs";
import useMeQuery from "~/lib/hooks/useMeQuery";
import { cn } from "~/lib/utils";

const SettingsView = () => {
  const { data: user } = useMeQuery();

  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-2xl">
        <div className="mt-2 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your {env.NEXT_PUBLIC_APP_NAME} profile
            </p>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="mb-4 grid w-full items-center gap-1.5">
          <Label htmlFor="name">Profile picture</Label>
          <div className="relative mr-2 h-16 w-16 flex-shrink-0 rounded-full bg-gray-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="rounded-full"
              src={`/${user?.id ?? ""}/avatar.png`}
              alt=""
            />
          </div>
        </div>

        <div className="mb-4 grid w-full items-center gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Full name"
            defaultValue={user?.name ?? ""}
          />
        </div>
        <div className="mb-4 grid  w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            disabled
            type="email"
            id="email"
            placeholder="Email"
            value={user?.email ?? ""}
          />
        </div>
        <Button>Update</Button>

        <div className="mt-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your work schedule
            </p>
          </div>
        </div>
        <Separator className="my-4" />
      </div>
    </>
  );
};

SettingsView.getLayout = getLayout;

export default SettingsView;

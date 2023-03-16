import { type SubmitHandler, useForm } from "react-hook-form";
import { env } from "~/env.mjs";

import useMeQuery from "~/lib/hooks/useMeQuery";
import { useToast } from "~/lib/hooks/useToast";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Separator } from "../ui/Separator";

type Inputs = {
  name: string,
  email: string,
};

export default function ProfileSettings() {
  const utils = api.useContext();
  const { toast } = useToast();

  const { data: user } = useMeQuery();
  const { mutate } = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      toast({ title: "Setting updated successfully", variant: "success"})
      await utils.user.me.invalidate();
    }
  });
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<Inputs>();
  const isDisabled = isSubmitting || !isDirty;
  const onSubmit: SubmitHandler<Inputs> = (data) => mutate(data);

  return (
    <div className="mb-4 grid w-full items-center gap-1.5">
      <div className="mt-2 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your {env.NEXT_PUBLIC_APP_NAME} profile
          </p>
        </div>
      </div>
      <Separator className="my-4" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
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

        <div className="mb-4">
          <Label htmlFor="name">Full name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Full name"
            defaultValue={user?.name ?? ""}
            {...register("name", { required: true })}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="Email"
            value={user?.email ?? ""}
            {...register("email", { required: true })}
          />
        </div>
        <Button disabled={isDisabled}>Update</Button>
      </form>
    </div>
  );
}

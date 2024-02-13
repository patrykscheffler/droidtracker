import React from "react";
import { useRouter } from "next/router";
import type { DateRange } from "react-day-picker";
import { endOfWeek, startOfWeek } from "date-fns";
import Image from "next/image";

import { getLayout } from "~/components/layouts/AppLayout";
import Meta from "~/components/ui/Meta";
import { Separator } from "~/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import TimeLogs from "~/components/timer/TimeLogs";
import TimeCards from "~/components/timer/TimeCards";
import { DatePickerWithRange } from "~/components/ui/DatePickerWithRange";
import { api } from "~/utils/api";

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: user } = api.user.getUserById.useQuery({
    userId: id as string,
  });

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const today = new Date();
      const from = startOfWeek(today);
      const to = endOfWeek(today);

      return {
        from,
        to,
      };
    }
  );

  if (!user) return;

  return (
    <>
      <Meta title="Timer" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 space-y-1">
          <Image
            className="rounded-full"
            src={`/${user.id}/avatar.png`}
            width={40}
            height={40}
            alt="User profile picture"
          />
          <h2 className="text-2xl font-semibold tracking-tight">{user.name}</h2>
        </div>
      </div>
      <Separator className="my-4" />
      <Tabs defaultValue="timelogs">
        <TabsList>
          <TabsTrigger value="timelogs">TimeLogs</TabsTrigger>
          <TabsTrigger value="timecards">TimeCards</TabsTrigger>
        </TabsList>
        <TabsContent value="timelogs" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <TimeLogs userId={id as string} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="timecards" className="space-y-4">
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
          <TimeCards userId={id as string} dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

UserPage.getLayout = getLayout;

export default UserPage;

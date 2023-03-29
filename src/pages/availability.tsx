import { format } from "date-fns";
import { useState } from "react";

import { getLayout } from "~/components/layouts/AppLayout";
import { DayPicker } from "~/components/ui/DayPicker";
import { Separator } from "~/components/ui/Separator";
import Meta from "~/components/ui/Meta";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/Button";
import { Send } from "lucide-react";
import { ButtonGroup } from "~/components/ui/ButtonGroup";

const AvailabilityView = () => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const { data: users } = api.schedule.getAvailabilityByDate.useQuery(
    {
      date: selectedDay
        ? new Date(
            Date.UTC(
              selectedDay.getFullYear(),
              selectedDay.getMonth(),
              selectedDay.getDate()
            )
          )
        : new Date(),
    },
    { enabled: !!selectedDay }
  );

  return (
    <>
      <Meta title="Availability" />
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Availability
            </h2>
          </div>
        </div>
        <Separator className="my-4" />

        <section className="flex gap-5">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
          />
          <Separator orientation="vertical" className="h-auto" />
          {selectedDay && (
            <div className="flex-grow">
              <h3>
                Availability on{" "}
                <span className="font-bold">{format(selectedDay, "PP")}</span>
              </h3>

              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex w-full max-w-full items-center justify-between py-4"
                >
                  <div className="flex items-center justify-center">
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
                    </div>
                    <div className="ml-2 flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">
                        {user.name}
                      </span>
                      {user.availabilities?.[0] ? (
                        <span className="text-xs">
                          {`${format(
                            user.availabilities[0].start,
                            "p"
                          )} - ${format(user.availabilities[0].end, "p")}`}
                        </span>
                      ) : (
                        <span className="text-xs">Unavailable</span>
                      )}
                    </div>
                  </div>
                  <ButtonGroup>
                    <Button href={`/${user.id}/chat`} variant="icon" size="sm">
                      <Send size="1rem" />
                    </Button>
                  </ButtonGroup>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

AvailabilityView.getLayout = getLayout;

export default AvailabilityView;

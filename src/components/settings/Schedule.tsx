import {
  type SubmitHandler,
  useFormContext,
  FormProvider,
  Controller,
  useForm,
} from "react-hook-form";
import { type GroupBase, type Props } from "react-select";
import { addMinutes, format } from "date-fns";
import { forwardRef, useMemo, useState } from "react";
import { Pencil, Plus, Trash } from "lucide-react";

import { useToast } from "~/lib/hooks/useToast";
import { weekdayNames } from "~/lib/weekday";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Select as ReactSelect } from "../ui/custom-select";
import { Separator } from "../ui/Separator";
import { Switch } from "../ui/Switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { DayPicker } from "../ui/DayPicker";
import { utcToZonedTime } from "date-fns-tz";
import { ButtonGroup } from "../ui/ButtonGroup";

export type TimeRange = {
  userId?: number | null;
  weekDay?: number;
  start: Date;
  end: Date;
};

export type Schedule = (TimeRange | null)[];

export const defaultDayRange: TimeRange = {
  start: new Date(new Date(0).setUTCHours(8, 0, 0, 0)),
  end: new Date(new Date(0).setUTCHours(16, 0, 0, 0)),
};

const emptyDayRange: TimeRange = {
  start: new Date(new Date(0).setUTCHours(0, 0, 0, 0)),
  end: new Date(new Date(0).setUTCHours(0, 0, 0, 0)),
};

interface IOption {
  readonly label: string;
  readonly value: number;
}

const useOptions = () => {
  const [filteredOptions, setFilteredOptions] = useState<IOption[]>([]);

  const options = useMemo(() => {
    const time = new Date(new Date(0).setUTCHours(0, 0, 0, 0));
    const endTime = addMinutes(time, 24 * 60);
    const options: IOption[] = [];

    while (time < endTime) {
      options.push({
        value: time.valueOf(),
        label: format(utcToZonedTime(time, "UTC"), "p"),
      });

      time.setMinutes(time.getMinutes() + 15);
    }

    return options;
  }, []);

  // TODO: Add options filtering

  return { options };
};

const ScheduleDay = ({
  name,
  dayName,
  weekDay,
}: {
  name: `schedule.${number}`;
  dayName: string;
  weekDay: number;
}) => {
  const { watch, setValue, control } = useFormContext<ScheduleInput>();
  const watchDayRange = watch(name);

  return (
    <div className="w-flex mb-4 flex">
      <div className="flex items-center">
        <Label className="flex flex-row items-center space-x-2">
          <Switch
            defaultChecked={!!watchDayRange}
            checked={!!watchDayRange}
            onCheckedChange={(isChecked) => {
              setValue(
                name,
                isChecked ? { ...defaultDayRange, weekDay } : null
              );
            }}
          />
          <span className="min-w-[100px]">{dayName}</span>
        </Label>
      </div>
      {watchDayRange && (
        <div className="flex sm:ml-2">
          <Controller
            control={control}
            name={name}
            render={({ field }) => <TimeRangeField {...field} />}
          />
        </div>
      )}
    </div>
  );
};

const TimeRangeField = forwardRef(
  (
    {
      className,
      value,
      onChange,
    }: {
      className?: string;
      value: TimeRange | null;
      onChange: (value: TimeRange) => void;
    },
    _ref
  ) => {
    if (!value) return null;
    return (
      <div className={className}>
        <TimeSelect
          className="inline-block w-[110px]"
          value={value.start}
          max={value.end}
          onChange={(option) => {
            onChange({ ...value, start: new Date(option?.value as number) });
          }}
        />
        <span className="mx-2 w-2 self-center"> - </span>
        <TimeSelect
          className="inline-block w-[110px] rounded-md"
          value={value.end}
          min={value.start}
          onChange={(option) => {
            onChange({ ...value, end: new Date(option?.value as number) });
          }}
        />
      </div>
    );
  }
);

TimeRangeField.displayName = "TimeRangeField";

const TimeSelect = ({
  value,
  min,
  max,
  ...props
}: Omit<Props<IOption, false, GroupBase<IOption>>, "value"> & {
  value: Date;
  min?: Date;
  max?: Date;
}) => {
  const { options } = useOptions();

  return (
    <ReactSelect
      options={options}
      value={options.find(
        (option) => option.value === new Date(value).valueOf()
      )}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      {...props}
    />
  );
};

type ScheduleInput = {
  schedule: Schedule;
};

const Schedule = () => {
  const utils = api.useContext();
  const { toast } = useToast();

  const { data: availabilites } = api.schedule.get.useQuery();
  const { mutate } = api.schedule.create.useMutation({
    onSuccess: async () => {
      await utils.schedule.get.invalidate();
      await utils.user.me.invalidate();
      toast({ title: "Schedule updated", variant: "success" });
    },
  });

  const methods = useForm<ScheduleInput>({
    values: availabilites && {
      schedule: availabilites || [],
    },
  });
  const { handleSubmit } = methods;
  const onSubmit: SubmitHandler<ScheduleInput> = (data) => {
    const availability = data.schedule.filter(
      (day) => day !== null
    ) as TimeRange[];
    mutate({ availability });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {weekdayNames().map((day, index) => {
          const name = `schedule.${index}` as const;

          return (
            <ScheduleDay key={day} name={name} dayName={day} weekDay={index} />
          );
        })}
        <Button>Update</Button>
      </form>
    </FormProvider>
  );
};

type DateOverrideInput = {
  id?: number;
  date: Date;
  range: TimeRange;
};

const DateOverrideDialog = ({
  trigger,
  dateOverride,
}: {
  trigger: React.ReactNode;
  dateOverride?: DateOverrideInput;
}) => {
  const [open, setOpen] = useState(false);
  const utils = api.useContext();
  const { watch, control, setValue, handleSubmit } = useForm<DateOverrideInput>(
    {
      values: dateOverride,
      defaultValues: {
        date: new Date(),
        range: defaultDayRange,
      },
    }
  );
  const watchDayRange = watch("range");
  const unavailableAllDay =
    watchDayRange.start.getTime() === watchDayRange.end.getTime();
  const { mutate: addOverride } = api.schedule.addOverride.useMutation({
    onSuccess: async () => {
      await utils.schedule.getOverrides.invalidate();
      setOpen(false);
    },
  });
  const { mutate: updateOverride } = api.schedule.updateOverride.useMutation({
    onSuccess: async () => {
      await utils.schedule.getOverrides.invalidate();
      setOpen(false);
    },
  });

  const onSubmit: SubmitHandler<DateOverrideInput> = (dateOverride) => {
    if (!dateOverride.date) return;

    if (dateOverride.id) {
      return updateOverride({
        id: dateOverride.id,
        date: new Date(
          Date.UTC(
            dateOverride.date.getFullYear(),
            dateOverride.date.getMonth(),
            dateOverride.date.getDate()
          )
        ),
        start: dateOverride.range.start,
        end: dateOverride.range.end,
      });
    }

    return addOverride({
      date: new Date(
        Date.UTC(
          dateOverride.date.getFullYear(),
          dateOverride.date.getMonth(),
          dateOverride.date.getDate()
        )
      ),
      start: dateOverride.range.start,
      end: dateOverride.range.end,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select date to override</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-3">
            <Controller
              control={control}
              name="date"
              render={({ field: { value, onChange } }) => (
                <DayPicker
                  fromDate={new Date()}
                  mode="single"
                  showOutsideDays
                  selected={value}
                  onSelect={onChange}
                />
              )}
            />
            <Separator orientation="vertical" className="h-auto" />
            <div className="flex w-[270px] flex-col gap-3">
              {!unavailableAllDay && (
                <Controller
                  control={control}
                  name="range"
                  render={({ field }) => <TimeRangeField {...field} />}
                />
              )}
              <Label className="flex flex-row items-center space-x-2">
                <Switch
                  checked={unavailableAllDay}
                  onCheckedChange={(isChecked) => {
                    setValue(
                      "range",
                      isChecked ? emptyDayRange : defaultDayRange
                    );
                  }}
                />
                <span>Unavailable all day</span>
              </Label>
              <div className="mt-auto flex justify-end gap-3">
                <Button variant="subtle" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button>{dateOverride?.id ? "Update" : "Save"}</Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DateOverrides = () => {
  const utils = api.useContext();
  const { data: overrides } = api.schedule.getOverrides.useQuery();
  const { mutate: deleteOverride } = api.schedule.deleteOverride.useMutation({
    onSuccess: async () => {
      await utils.schedule.getOverrides.invalidate();
    },
  });

  return (
    <div>
      <DateOverrideDialog
        trigger={
          <Button className="self-start">
            <Plus size="16" /> Add date override
          </Button>
        }
      />
      {(overrides?.length ?? 0) > 0 && (
        <div className="mt-5 mb-16 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          {overrides?.map((override) => (
            <div
              key={override.id}
              className="group flex w-full max-w-full items-center justify-between overflow-hidden border-b border-gray-200 px-4 py-4 last:border-0 hover:bg-gray-50 sm:px-6"
            >
              <div className="flex flex-col justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {override.date ? format(override.date, "PP") : "-"}
                </span>
                <span className="text-xs">
                  {override.start.getTime() === override.end.getTime()
                    ? "Unavailable all day"
                    : `${format(
                        utcToZonedTime(override.start, "UTC"),
                        "p"
                      )} - ${format(utcToZonedTime(override.end, "UTC"), "p")}`}
                </span>
              </div>
              <div>
                <ButtonGroup combined>
                  <DateOverrideDialog
                    dateOverride={{
                      id: override.id,
                      date: override.date!,
                      range: {
                        start: override.start,
                        end: override.end,
                      },
                    }}
                    trigger={
                      <Button variant="icon" size="sm">
                        <Pencil size="1rem" />
                      </Button>
                    }
                  />
                  <Button
                    onClick={() => deleteOverride({ id: override.id })}
                    variant="icon"
                    size="sm"
                  >
                    <Trash size="1rem" />
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProfileSchedule() {
  return (
    <div className="mb-4 grid w-full items-center">
      <div className="mt-2 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your work schedule
          </p>
        </div>
      </div>
      <Separator className="my-4" />

      <Schedule />

      <div className="mt-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Date overrides
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add dates when your availability changes from your daily hours.
          </p>
        </div>
      </div>
      <Separator className="my-4" />

      <DateOverrides />
    </div>
  );
}

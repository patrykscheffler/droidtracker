import {
  type SubmitHandler,
  useFormContext,
  FormProvider,
  Controller,
  useForm,
} from "react-hook-form";
import { type GroupBase, type Props } from "react-select";
import { addMinutes, format, startOfDay } from "date-fns";
import { forwardRef, useMemo, useState } from "react";

import { useToast } from "~/lib/hooks/useToast";
import { weekdayNames } from "~/lib/weekday";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Select as ReactSelect } from "../ui/custom-select";
import { Separator } from "../ui/Separator";
import { Switch } from "../ui/Switch";

export type TimeRange = {
  userId?: number | null;
  weekDay?: number;
  start: Date;
  end: Date;
};

export type Schedule = (TimeRange | null)[];

export const defaultDayRange: TimeRange = {
  start: new Date(new Date(0).setHours(8, 0, 0, 0)),
  end: new Date(new Date(0).setHours(16, 0, 0, 0)),
};

interface IOption {
  readonly label: string;
  readonly value: number;
}

const useOptions = () => {
  const [filteredOptions, setFilteredOptions] = useState<IOption[]>([]);

  const options = useMemo(() => {
    const time = startOfDay(new Date(0));
    const endTime = addMinutes(startOfDay(new Date(0)), 24 * 60);
    const options: IOption[] = [];

    while (time < endTime) {
      options.push({
        value: time.valueOf(),
        label: format(time, "p"),
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

export default function ProfileSchedule() {
  return (
    <div className="mb-4 grid w-full items-center gap-1.5">
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

      <div className="mt-2 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Overridden dates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add dates when your availability changes from your daily hours.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  );
}

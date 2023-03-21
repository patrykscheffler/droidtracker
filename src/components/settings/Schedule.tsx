import { type SubmitHandler, useForm } from "react-hook-form";

import { useToast } from "~/lib/hooks/useToast";
import { weekdayNames } from "~/lib/weekday";
import { api } from "~/utils/api";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Select as ReactSelect } from "../ui/custom-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Separator } from "../ui/Separator";
import { Switch } from "../ui/Switch";

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const ScheduleDay = ({ day, index }: {
  day: string,
  index: number,
}) => {
  return (
    <div className="mb-4 flex w-flex">
      <div className="flex items-center">
        <Label className="flex flex-row items-center space-x-2">
          <Switch />
          <span className="min-w-[100px]">{day}</span>
        </Label>
      </div>
      <div className="flex">
        <ReactSelect
          options={options}
          components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
        />
        <span className="mx-2 w-2 self-center"> - </span>
        <Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
      </div>
    </div>
  );
}

const Schedule = () => {
  return (
    <>
      {weekdayNames().map((day, index) => {
        return (
          <ScheduleDay key={day} day={day} index={index} />
        );
      }) }
    </>
  )
}

type Inputs = {
  name: string,
  email: string,
};

export default function ProfileSchedule() {
  const utils = api.useContext();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<Inputs>();
  const isDisabled = isSubmitting || !isDirty;
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Button disabled={isDisabled}>Update</Button>
      </form>
    </div>
  );
}

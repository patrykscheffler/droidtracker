"use client";

import * as React from "react";
import { add, format, isBefore, parse } from "date-fns";

import { Button } from "~/components/ui/Button";
import { Calendar } from "~/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover";
import { Input } from "./Input";
import { Label } from "./Label";

type Props = {
  start: Date;
  end: Date | null;
  onUpdate: ({ start, end }: { start?: Date; end?: Date }) => void;
};

export function DatePickerWithTimeRange({ start, end, onUpdate }: Props) {
  const [startInput, setStartInput] = React.useState(
    start ? format(start, "p") : ""
  );
  const [endInput, setEndInput] = React.useState(end ? format(end, "p") : "");

  React.useEffect(() => {
    setStartInput(start ? format(start, "p") : "");
  }, [start]);

  React.useEffect(() => {
    setEndInput(end ? format(end, "p") : "");
  }, [end]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto w-[180px] py-0">
          {start && format(start, "p")} - {end && format(end, "p")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <div className="flex justify-between gap-2">
          <div className="grid items-center gap-1.5">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              autoFocus={false}
              className="w-[120px]"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              onBlur={() => {
                if (startInput === format(start, "p")) return;
                const startDate = parse(startInput, "p", start);

                if (isNaN(startDate.getTime()) ) {
                  setStartInput(start ? format(start, "p") : "");
                  return;
                } 

                let endDate = parse(endInput, "p", start);
                if (isBefore(endDate, startDate)) {
                  endDate = add(endDate, { days: 1 });
                }

                onUpdate({ start: startDate, end: endDate });
              }}
            />
          </div>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              autoFocus={false}
              className="w-[120px]"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              onBlur={() => {
                if (end && endInput === format(end, "p")) return;
                let endDate = parse(endInput, "p", start);

                if (isNaN(endDate.getTime())) {
                  setEndInput(end ? format(end, "p") : "");
                  return;
                } 

                const startDate = parse(startInput, "p", start);
                if (isBefore(endDate, startDate)) {
                  endDate = add(endDate, { days: 1 });
                }
                
                onUpdate({ start: startDate, end: endDate });
              }}
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={start}
            onSelect={(date) => {
              if (!date) return;

              // Extract time components from anotherDate
              const hoursToAdd = start.getHours();
              const minutesToAdd = start.getMinutes();
              const secondsToAdd = start.getSeconds();

              // Add the extracted time to the target date
              const startDate = add(date, {
                hours: hoursToAdd,
                minutes: minutesToAdd,
                seconds: secondsToAdd,
              });
              const endDate = parse(endInput, "p", startDate);

              onUpdate({ start: startDate, end: endDate });
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";

import { Input } from "./Input";
import { formatDuration, getDuration } from "~/lib/utils";

type Props = {
  duration: number | null;
  onUpdate: (duration: number) => void;
  disabled?: boolean;
};

export function DurationInput({ duration, onUpdate, disabled }: Props) {
  const [durationInput, setDurationInput] = React.useState(
    duration ? formatDuration(duration) : ""
  );

  React.useEffect(() => {
    setDurationInput(duration ? formatDuration(duration) : "");
  }, [duration]);

  return (
    <Input
      disabled={disabled}
      className="h-auto w-[80px] border-0 px-1 py-0"
      value={durationInput}
      onChange={(e) => setDurationInput(e.target.value)}
      onBlur={() => {
        const newDuration = getDuration(durationInput);
        if (newDuration) {
          onUpdate(newDuration);
        } else {
          setDurationInput(duration ? formatDuration(duration) : "");
        }
      }}
    />
  );
}

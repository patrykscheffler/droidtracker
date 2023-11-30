import * as React from "react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover";
import { CheckIcon, PlusCircle } from "lucide-react";
import { Separator } from "../ui/Separator";
import { Badge } from "../ui/Badge";

interface Props {
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function Filter({ title, options, value, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-auto border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {value?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="hidden space-x-1 lg:flex">
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {value.length} selected
                </Badge>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {/* <CommandInput placeholder={title} /> */}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value?.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(value?.filter((v) => v !== option.value));
                      } else {
                        onChange([...(value || []), option.value]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => onChange([])}
                className="justify-center text-center"
              >
                Clear filters
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

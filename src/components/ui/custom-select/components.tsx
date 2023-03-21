import { Check } from "lucide-react";
import type {
  ControlProps,
  GroupBase,
  InputProps,
  MenuListProps,
  MenuProps,
  MultiValueProps,
  OptionProps,
  SingleValueProps,
  ValueContainerProps,
} from "react-select";
import { components as reactSelectComponents } from "react-select";

import { cn } from "~/lib/utils";

export const InputComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  inputClassName,
  ...props
}: InputProps<Option, IsMulti, Group>) => {
  return (
    <reactSelectComponents.Input
      inputClassName={cn(
        "focus:ring-0 focus:ring-offset-0 dark:!text-darkgray-900 !text-black",
        inputClassName
      )}
      {...props}
    />
  );
};

export const OptionComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: OptionProps<Option, IsMulti, Group>) => {
  return (
    <reactSelectComponents.Option
      {...props}
      className={cn(
        className,
        "dark:bg-darkgray-100 !flex !cursor-pointer justify-between !py-3",
        props.isFocused && "dark:!bg-darkgray-200 !bg-gray-100",
        props.isSelected && "dark:!bg-darkgray-300 !bg-slate-900"
      )}>
      <>
        <span className="mr-auto">{props.label}</span>
        {props.isSelected && <Check className="ml-2 h-4 w-4" />}
      </>
    </reactSelectComponents.Option>
  );
};

export const ControlComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: ControlProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.Control
    {...props}
    className={cn(
      className,
      'dark:bg-darkgray-100 dark:border-darkgray-300 !min-h-9 h-9 !border-slate-300 bg-white text-sm leading-4 placeholder:text-sm placeholder:font-normal focus-within:border-slate-400 focus-within:hover:border-slate-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-400 hover:border-slate-400 dark:focus-within:ring-white'
    )}
  />
);

export const SingleValueComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: SingleValueProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.SingleValue
    {...props}
    className={cn(
      className,
      "dark:text-darkgray-900 dark:placeholder:text-darkgray-500 text-black placeholder:text-gray-400"
    )}
  />
);

export const ValueContainerComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: ValueContainerProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.ValueContainer
    {...props}
    className={cn(
      "dark:text-darkgray-900 dark:placeholder:text-darkgray-500 text-black placeholder:text-gray-400",
      className
    )}
  />
);

export const MultiValueComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MultiValueProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.MultiValue
    {...props}
    className={cn(
      "dark:bg-darkgray-200 dark:text-darkgray-900 !rounded-md bg-gray-100 text-gray-700",
      className
    )}
  />
);

export const MenuComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MenuProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.Menu
    {...props}
    className={cn(
      "dark:bg-darkgray-100 !rounded-md bg-white text-sm leading-4 dark:text-white",
      className
    )}
  />
);

export const MenuListComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MenuListProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.MenuList
    {...props}
    className={cn("scroll-bar scrollbar-track-w-20 rounded-md", className)}
  />
);

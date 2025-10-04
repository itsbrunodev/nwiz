import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Label } from "./label";

interface InputProps extends React.ComponentProps<"input"> {
  label: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

function Input({
  label,
  containerClassName,
  labelClassName,
  inputClassName,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  ...props
}: InputProps) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setHasValue(String(value).length > 0);
    } else if (defaultValue !== undefined) {
      setHasValue(String(defaultValue).length > 0);
    }
  }, [value, defaultValue]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  const isLabelElevated = isFocused || hasValue;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-input bg-background shadow-xs outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-aria-invalid:border-destructive has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 has-[input:is(:disabled)]:*:pointer-events-none dark:has-aria-invalid:ring-destructive/40",
        containerClassName,
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 text-muted-foreground transition-all duration-200 ease-in-out",
          isLabelElevated
            ? "top-2 font-medium text-xs"
            : "-translate-y-1/2 top-1/2 text-sm",
          labelClassName,
        )}
      >
        {label}
      </Label>
      <input
        ref={inputRef}
        className={cn(
          "flex h-12 w-full bg-transparent px-3 text-foreground text-sm transition-all duration-200 ease-in-out focus-visible:outline-none",
          isLabelElevated ? "pt-6 pb-2" : "py-3",
          inputClassName,
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
        id={id}
      />
    </div>
  );
}

export { Input };

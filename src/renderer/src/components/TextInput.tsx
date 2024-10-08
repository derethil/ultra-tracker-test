import { ComponentProps, forwardRef } from "react";
import { FieldError } from "react-hook-form";
import WarningIcon from "~/assets/icons/warning-circle.svg?react";
import { classed } from "~/lib/classed";
import { Stack } from "./Stack";

export const InputBaseStyles =
  "p-2 w-full font-medium rounded-md border-2 outline-none bg-surface-secondary font-display light:placeholder:text-on-surface-hover border-component dark:placeholder:text-component-strong";

const Input = classed.input({
  base: InputBaseStyles,
  variants: {
    hasError: {
      true: "border-warning",
      false: "border-component"
    },
    isDisabled: {
      true: "text-on-surface",
      false: "text-on-component"
    }
  },
  defaultVariants: {
    hasError: false
  }
});

export const Label = classed.label({
  base: "text-xl font-bold uppercase font-display text-on-component"
});

type InputProps = ComponentProps<typeof Input>;
type LabelProps = Omit<ComponentProps<typeof Label>, "for">;

export interface TextInputProps extends InputProps {
  label?: string;
  labelProps?: LabelProps;
  error?: FieldError;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { label, error, labelProps, ...rest } = props;
  return (
    <Stack direction="col" className={`gap-1 ${props.className}`}>
      <Stack direction="row" align="center" className="gap-2.5">
        {label && <Label {...labelProps}>{label}</Label>}
        {error && <WarningIcon width={20} className="fill-warning animate-in slide-in-from-left" />}
      </Stack>
      <Input
        {...rest}
        ref={ref}
        hasError={Boolean(props.error)}
        isDisabled={Boolean(props.disabled)}
      />
    </Stack>
  );
});

TextInput.displayName = "TextInput";

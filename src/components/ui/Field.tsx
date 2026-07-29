import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { Input } from "./Input";
import { PasswordInput } from "./PasswordInput";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

const FLOATABLE_TYPES: unknown[] = [Input, Select, Textarea, PasswordInput];

type FloatableProps = {
  id?: string;
  placeholder?: string;
  className?: string;
};

function isFloatable(
  node: ReactNode,
): node is ReactElement<FloatableProps> {
  return isValidElement(node) && FLOATABLE_TYPES.includes(node.type);
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const generatedId = useId();

  if (isFloatable(children)) {
    const isSelect = children.type === Select;
    const id = children.props.id ?? generatedId;

    const field = cloneElement(children, {
      id,
      placeholder: children.props.placeholder ?? " ",
      className: `peer w-full pt-5! pb-1.5! placeholder:text-transparent focus:placeholder:text-muted/60 ${children.props.className ?? ""}`,
    });

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          {field}
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-3 top-1.5 z-10 origin-left text-xs text-muted transition-all duration-150 ${
              isSelect
                ? ""
                : "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm"
            } peer-focus:top-1.5 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary`}
          >
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        </div>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground/90">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

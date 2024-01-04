import { Fragment, ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Combobox } from "@headlessui/react";
import { usePopper } from "react-popper";
import { Placement } from "@popperjs/core";
import { Check, ChevronDown, Search } from "lucide-react";
// hooks
import { useApplication, useCycle } from "hooks/store";
// icons
import { ContrastIcon } from "@plane/ui";
// helpers
import { cn } from "helpers/common.helper";
// types
import { ICycle } from "@plane/types";
import { TButtonVariants } from "./types";

type Props = {
  button?: ReactNode;
  buttonClassName?: string;
  buttonContainerClassName?: string;
  buttonVariant: TButtonVariants;
  className?: string;
  disabled?: boolean;
  dropdownArrow?: boolean;
  onChange: (val: string | null) => void;
  placement?: Placement;
  projectId: string;
  value: string | null;
};

type ButtonProps = {
  className?: string;
  cycle: ICycle | null;
  hideText?: boolean;
  dropdownArrow: boolean;
};

type DropdownOptions =
  | {
      value: string | null;
      query: string;
      content: JSX.Element;
    }[]
  | undefined;

const BorderButton = (props: ButtonProps) => {
  const { className, cycle, dropdownArrow, hideText = false } = props;

  return (
    <div
      className={cn(
        "h-full flex items-center gap-1.5 border-[0.5px] border-custom-border-300 hover:bg-custom-background-80 rounded text-xs px-2 py-0.5",
        className
      )}
    >
      <ContrastIcon className="h-3 w-3 flex-shrink-0" />
      {!hideText && <span className="flex-grow truncate">{cycle?.name ?? "Cycle"}</span>}
      {dropdownArrow && <ChevronDown className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />}
    </div>
  );
};

const BackgroundButton = (props: ButtonProps) => {
  const { className, cycle, dropdownArrow, hideText = false } = props;

  return (
    <div
      className={cn("h-full flex items-center gap-1.5 rounded text-xs px-2 py-0.5 bg-custom-background-80", className)}
    >
      <ContrastIcon className="h-3 w-3 flex-shrink-0" />
      {!hideText && <span className="flex-grow truncate">{cycle?.name ?? "Cycle"}</span>}
      {dropdownArrow && <ChevronDown className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />}
    </div>
  );
};

const TransparentButton = (props: ButtonProps) => {
  const { className, cycle, dropdownArrow, hideText = false } = props;

  return (
    <div
      className={cn(
        "h-full flex items-center gap-1.5 rounded text-xs px-2 py-0.5 hover:bg-custom-background-80",
        className
      )}
    >
      <ContrastIcon className="h-3 w-3 flex-shrink-0" />
      {!hideText && <span className="flex-grow truncate">{cycle?.name ?? "Cycle"}</span>}
      {dropdownArrow && <ChevronDown className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />}
    </div>
  );
};

export const CycleDropdown: React.FC<Props> = observer((props) => {
  const {
    button,
    buttonClassName,
    buttonContainerClassName,
    buttonVariant,
    className = "",
    disabled = false,
    dropdownArrow = false,
    onChange,
    placement,
    projectId,
    value,
  } = props;
  // states
  const [query, setQuery] = useState("");
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  // popper-js init
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });
  // store hooks
  const {
    router: { workspaceSlug },
  } = useApplication();
  const { getProjectCycleIds, fetchAllCycles, getCycleById } = useCycle();
  const cycleIds = getProjectCycleIds(projectId);

  const options: DropdownOptions = cycleIds?.map((cycleId) => {
    const cycleDetails = getCycleById(cycleId);

    return {
      value: cycleId,
      query: `${cycleDetails?.name}`,
      content: (
        <div className="flex items-center gap-2">
          <ContrastIcon className="h-3 w-3 flex-shrink-0" />
          <span className="flex-grow truncate">{cycleDetails?.name}</span>
        </div>
      ),
    };
  });
  options?.unshift({
    value: null,
    query: "No cycle",
    content: (
      <div className="flex items-center gap-2">
        <ContrastIcon className="h-3 w-3 flex-shrink-0" />
        <span className="flex-grow truncate">No cycle</span>
      </div>
    ),
  });

  const filteredOptions =
    query === "" ? options : options?.filter((o) => o.query.toLowerCase().includes(query.toLowerCase()));

  // fetch cycles of the project if not already present in the store
  useEffect(() => {
    if (!workspaceSlug) return;

    if (!cycleIds) fetchAllCycles(workspaceSlug, projectId);
  }, [cycleIds, fetchAllCycles, projectId, workspaceSlug]);

  const selectedCycle = value ? getCycleById(value) : null;

  return (
    <Combobox
      as="div"
      className={cn("h-full flex-shrink-0", {
        className,
      })}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <Combobox.Button as={Fragment}>
        {button ? (
          <button
            ref={setReferenceElement}
            type="button"
            className={cn("block h-full w-full outline-none", buttonContainerClassName)}
          >
            {button}
          </button>
        ) : (
          <button
            ref={setReferenceElement}
            type="button"
            className={cn(
              "block h-full max-w-full outline-none",
              {
                "cursor-not-allowed text-custom-text-200": disabled,
                "cursor-pointer": !disabled,
              },
              buttonContainerClassName
            )}
          >
            {buttonVariant === "border-with-text" ? (
              <BorderButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
              />
            ) : buttonVariant === "border-without-text" ? (
              <BorderButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                hideText
              />
            ) : buttonVariant === "background-with-text" ? (
              <BackgroundButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
              />
            ) : buttonVariant === "background-without-text" ? (
              <BackgroundButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                hideText
              />
            ) : buttonVariant === "transparent-with-text" ? (
              <TransparentButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
              />
            ) : buttonVariant === "transparent-without-text" ? (
              <TransparentButton
                cycle={selectedCycle}
                className={buttonClassName}
                dropdownArrow={dropdownArrow && !disabled}
                hideText
              />
            ) : null}
          </button>
        )}
      </Combobox.Button>
      <Combobox.Options className="fixed z-10">
        <div
          className="my-1 w-48 rounded border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-xs shadow-custom-shadow-rg focus:outline-none"
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="flex items-center gap-1.5 rounded border border-custom-border-100 bg-custom-background-90 px-2">
            <Search className="h-3.5 w-3.5 text-custom-text-400" strokeWidth={1.5} />
            <Combobox.Input
              className="w-full bg-transparent py-1 text-xs text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              displayValue={(assigned: any) => assigned?.name}
            />
          </div>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-scroll">
            {filteredOptions ? (
              filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active, selected }) =>
                      `w-full truncate flex items-center justify-between gap-2 rounded px-1 py-1.5 cursor-pointer select-none ${
                        active ? "bg-custom-background-80" : ""
                      } ${selected ? "text-custom-text-100" : "text-custom-text-200"}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className="flex-grow truncate">{option.content}</span>
                        {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </>
                    )}
                  </Combobox.Option>
                ))
              ) : (
                <p className="text-custom-text-400 italic py-1 px-1.5">No matches found</p>
              )
            ) : (
              <p className="text-custom-text-400 italic py-1 px-1.5">Loading...</p>
            )}
          </div>
        </div>
      </Combobox.Options>
    </Combobox>
  );
});
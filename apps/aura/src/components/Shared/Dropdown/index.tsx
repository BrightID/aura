import { JSX } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DropdownItem {
  label: JSX.Element;
  value: string | number;
}

export default function Dropdown<T extends DropdownItem>({
  isDropdownOpen,
  setIsDropdownOpen,
  selectedItem,
  items,
  onItemClick,
  className,
  ...props
}: {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  selectedItem: T;
  items: T[];
  onItemClick: (item: T) => void;
  className?: string;
}) {
  return (
    <Select
      open={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onValueChange={(e) => {
        onItemClick(items.find((item) => item.value?.toString() === e)!);
      }}
      value={selectedItem.value?.toString()}
    >
      <SelectTrigger
        {...props}
        className={`${className} w-auto bg-background text-foreground dark:bg-dark-primary`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-100">
        {items.map((item) => (
          <SelectItem
            data-testid={`dropdown-option-${item.value}`}
            key={item.value}
            {...{
              onMouseDown: process.env.VITEST
                ? undefined
                : () => {
                    onItemClick(item);
                    setIsDropdownOpen(false);
                  },

              onClick: process.env.VITEST
                ? () => {
                    onItemClick(item);
                    setIsDropdownOpen(false);
                  }
                : undefined,
            }}
            value={item.value.toString()}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

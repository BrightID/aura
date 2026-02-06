import { Key, ReactNode, useState } from 'react';

interface SelectableItem<T extends Key> {
  id: T;
  title: string;
  icon?: string;
}

export function SelectItems<T extends SelectableItem<R>, R extends Key>({
  title,
  isOpenInitial,
  items,
  selectedItemId,
  setSelectedItemId,
  renderItem,
}: {
  title: string;
  isOpenInitial: boolean;
  items: T[];
  selectedItemId: R | null;
  setSelectedItemId: (itemId: R | null) => void;
  renderItem: (item: T) => ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(isOpenInitial);
  return (
    <div className="flex flex-col w-full gap-2.5">
      <div className="flex justify-between">
        <div className="flex gap-1">
          <p>{title}</p>
          {selectedItemId !== null && (
            <>
              <span> (1)</span>
              <span
                className="text-nl3 font-bold cursor-pointer"
                onClick={() => setSelectedItemId(null)}
              >
                {' '}
                clear
              </span>
            </>
          )}
        </div>
        <img
          className="cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          src={`${
            isOpen
              ? '/assets/images/Shared/minus-icon.svg'
              : '/assets/images/Shared/plus-icon.svg'
          }`}
          alt=""
        />
      </div>
      {isOpen && (
        <div className="flex flex-row flex-wrap gap-2">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

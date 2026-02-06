import * as React from 'react';
import { JSX, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

interface InfiniteScrollLocalProps<T> extends React.HTMLProps<InfiniteScroll> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => JSX.Element;
  pageSize?: number;

  getScrollParent?(): HTMLElement | null;
}

const isTest = process.env.VITEST;

export default function InfiniteScrollLocal<T>({
  items,
  renderItem,
  pageSize,
  ...props
}: InfiniteScrollLocalProps<T>) {
  const [itemsLocal, setItemsLocal] = useState<T[]>([]);
  const itemsRef = useRef<typeof items>(null);
  const isInitialLoadRef = useRef(true);

  // Only reset itemsLocal when items reference changes
  useEffect(() => {
    // Check if items has actually changed (not just a re-render)
    if (items !== itemsRef.current) {
      itemsRef.current = items;
      setItemsLocal([]);
      isInitialLoadRef.current = true;
    }
  }, [items]);

  const loadMore = useCallback(() => {
    if (!items) return;

    // Prevent multiple loadMore calls during initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      // Load initial batch
      setItemsLocal(items.slice(0, pageSize ?? 10));
    } else {
      // Load next batch
      setItemsLocal((itemsLocalPrev) => {
        // Avoid duplicate loads
        if (itemsLocalPrev.length >= items.length) return itemsLocalPrev;

        return [
          ...itemsLocalPrev,
          ...items.slice(
            itemsLocalPrev.length,
            itemsLocalPrev.length + (pageSize ?? 10),
          ),
        ];
      });
    }
  }, [items, pageSize]);

  const hasMore = useMemo(
    () => !!items && items.length > itemsLocal.length,
    [items, itemsLocal.length],
  );
  if (isTest) {
    return (
      <>
        {items?.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {items && (
        <InfiniteScroll
          {...props}
          pageStart={0}
          loadMore={loadMore}
          hasMore={hasMore}
          initialLoad={isInitialLoadRef.current}
          useWindow={false}
        >
          {itemsLocal.map((item, index) => (
            <React.Fragment key={index}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </InfiniteScroll>
      )}
    </>
  );
}

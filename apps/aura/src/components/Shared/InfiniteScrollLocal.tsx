import * as React from 'react';
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

interface InfiniteScrollLocalProps<T> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => JSX.Element;
  getKey?: (item: T, index: number) => string | number;
  pageSize?: number;
  className?: string;
  getScrollParent?(): HTMLElement | null;
}

const isTest = process.env.VITEST;

export default function InfiniteScrollLocal<T>({
  items,
  renderItem,
  getKey,
  pageSize = 10,
  ...props
}: InfiniteScrollLocalProps<T>) {
  const [itemsLocal, setItemsLocal] = useState<T[]>([]);
  const itemsRef = useRef<typeof items>(null);

  // When items reference changes, immediately populate first batch.
  // Do NOT reset to [] — InfiniteScroll's initialLoad only fires once per mount,
  // so resetting to [] leaves the list empty until user scrolls.
  useEffect(() => {
    if (items !== itemsRef.current) {
      itemsRef.current = items;
      setItemsLocal(items ? items.slice(0, pageSize) : []);
    }
  }, [items, pageSize]);

  const loadMore = useCallback(() => {
    if (!items) return;
    setItemsLocal((prev) => {
      if (prev.length >= items.length) return prev;
      return [...prev, ...items.slice(prev.length, prev.length + pageSize)];
    });
  }, [items, pageSize]);

  const hasMore = useMemo(
    () => !!items && items.length > itemsLocal.length,
    [items, itemsLocal.length],
  );

  if (isTest) {
    return (
      <>
        {items?.map((item, index) => (
          <React.Fragment key={getKey ? getKey(item, index) : index}>
            {renderItem(item, index)}
          </React.Fragment>
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
          initialLoad={false}
          useWindow={false}
        >
          {itemsLocal.map((item, index) => (
            <React.Fragment key={getKey ? getKey(item, index) : index}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </InfiniteScroll>
      )}
    </>
  );
}

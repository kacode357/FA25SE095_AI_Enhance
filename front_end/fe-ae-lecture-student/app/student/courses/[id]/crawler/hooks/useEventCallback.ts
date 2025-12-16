"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Stable callback reference that always invokes the latest handler implementation.
 * Helps when passing callbacks into event emitters outside React's lifecycle.
 */
export default function useEventCallback<T extends (...args: any[]) => any>(
  handler: T
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return handlerRef.current(...args);
  }, []);
}


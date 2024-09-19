import { useEffect, useRef, useState } from "react";

const DEFAULT_DELAY = 500;

export interface IUseDebouncedValueParams {
  /**
   * Debounce time period in milliseconds.
   * @default 500
   */
  delay?: number;
}

export type IUseDebouncedValueResult<TValue> = [
  /**
   * Debounced value.
   */
  TValue,
  /**
   * Setter for the debounced value.
   */
  (value: TValue) => void,
];

export const useDebouncedValue = <TValue>(
  value: TValue,
  params: IUseDebouncedValueParams = {}
): IUseDebouncedValueResult<TValue> => {
  const { delay } = params;

  const [debouncedValue, setDebouncedValue] = useState(value);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay ?? DEFAULT_DELAY);

    return () => clearTimeout(timeoutRef.current);
  }, [value, delay, params]);

  return [debouncedValue, setDebouncedValue];
};

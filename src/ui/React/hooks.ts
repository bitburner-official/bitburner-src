import { useCallback, useEffect, useState } from "react";

/** Hook that returns a function for the component. Optionally set an interval to rerender the component.
 * @param autoRerenderTime: Optional. If provided and nonzero, used as the ms interval to automatically call the rerender function.
 */
export function useRerender(autoRerenderTime?: number) {
  const setRerender = useState(false)[1];
  const rerender = () => setRerender((old) => !old);
  useEffect(() => {
    if (!autoRerenderTime) return;
    const intervalID = setInterval(rerender, autoRerenderTime);
    return () => clearInterval(intervalID);
  }, []);
  return rerender;
}

export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((old) => !old);
  }, []);

  const on = useCallback(() => {
    setValue(true);
  }, []);

  const off = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, on, off }] as const;
}

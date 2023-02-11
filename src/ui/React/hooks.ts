import { useEffect, useState } from "react";

/** Hook that returns a function for the component. Optionally set an interval to rerender the component.
 * @param autoRerenderTime: Optional. If provided and nonzero, used as the ms interval to automatically call the rerender function.
 */
export function useRerender(ms?: number) {
  const setRerender = useState(false)[1];
  const rerender = () => setRerender((old) => !old);
  useEffect(() => {
    if (!ms) return;
    const intervalID = setInterval(rerender, ms);
    return () => clearInterval(intervalID);
  }, []);
  return rerender;
}

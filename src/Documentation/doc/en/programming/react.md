# How to use React in game

Since v2.7.0, Bitburner supports React and TypeScript out of the box. You can use the jsx syntax inside `.jsx` and `.tsx` files.

## Example

Use `ns.printRaw` and `ns.tprintRaw` to render React elements in the logs and terminal.

```tsx
// timer.tsx
function Timer() {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>Seconds: {seconds}</div>;
}

export async function main(ns: NS) {
  ns.tail();
  ns.printRaw(<Timer />);
  await ns.asleep(10000);
}
```

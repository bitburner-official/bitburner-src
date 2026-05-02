# How to use TypeScript and React in game

Bitburner supports TypeScript and React out of the box.

You can write TypeScript scripts in `.ts` files and use the jsx syntax inside `.jsx` and `.tsx` files. You can run them with the `run` CLI as if they are normal JS files. For example, you can run the `timer.tsx` file in the next section by running `run timer.tsx` in the terminal tab.

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
  ns.ui.openTail();
  ns.printRaw(<Timer />);
  await ns.asleep(10000);
}
```

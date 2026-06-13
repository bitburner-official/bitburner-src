export type InternedString = {
  readonly value: string;
};

class InternedStringValue implements InternedString {
  constructor(readonly value: string) {}
}

const emptyInternedString = new InternedStringValue("");
const internedStrings = new Map<string, WeakRef<InternedStringValue>>();

const finalizer = new FinalizationRegistry<string>((value) => {
  const ref = internedStrings.get(value);
  if (!ref?.deref()) internedStrings.delete(value);
});

//Keep 1 copy of the string in memory.  Remove once there are no more references.
export function internString(value: string): InternedString {
  //Each script starts with a "" for code.  Don't intern "", just return the default emptyInternedString
  if (value === "") return emptyInternedString;

  const existing = internedStrings.get(value)?.deref();
  if (existing) return existing;

  const interned = new InternedStringValue(value);
  internedStrings.set(value, new WeakRef(interned));
  finalizer.register(interned, value);
  return interned;
}

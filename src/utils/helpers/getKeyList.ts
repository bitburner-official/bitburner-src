/** Function for getting a list of keys to use for saving an object
 * @param ctor the class constructor
 *
 * @param removedKeys Keys that exist on a default constructed member, but should not be saved.
 *                    These keys will just revert to default values on load.
 *
 * @param addedKeys   Optional keys that do not exist on a default constructed member, but should be saved when present.
 */
export function getKeyList(
  ctor: new () => object,
  modifications?: { removedKeys?: readonly string[]; addedKeys?: readonly string[] },
): readonly string[] {
  const newObj = new ctor();
  const keySet = new Set<string>(Object.keys(newObj));
  modifications?.removedKeys?.forEach((key) => keySet.delete(key));
  modifications?.addedKeys?.forEach((key) => keySet.add(key));
  return [...keySet];
}

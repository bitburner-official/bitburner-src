/**
 * A subset of the true KeyboardEvent, this contains only the properties we
 * actually guarantee to set.
 */
export interface KeyboardLikeEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  preventDefault?: () => void;
}

export interface InfiltrationStage {
  onKey: (event: KeyboardLikeEvent) => void;
}

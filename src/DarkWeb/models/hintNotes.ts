import { defaultSettingsDictionary, dogNameDictionary } from "./dictionaryData";

export const tutorials = [
  "I've heard there are valuable .cache files to find.",
  "I ran this .cache and it had crazy stuff in it!",
  "My scripts went down again when their server went offline. I'll have to do something about that.",
  ];

export const puzzleHints = [
  "Some servers will tell you if you get some chars in the password correct.",
  "I found a server that takes longer to respond if you get some chars in the password correct.",
  "Some servers only respond with raw binary data. I wonder what each bit represents?",
  `what should I name my dog? ${dogNameDictionary.join(", ")}?`,
  `The factory default is usually one of ${defaultSettingsDictionary.join(", ")}.`,
  ];

// TODO: longer dictionary parts in hint from commonPasswordDictionary
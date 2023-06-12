import type { IPAddress } from "../Types/strings";
import { getRandomByte } from "./helpers/getRandomByte";

/**
 * Generate a random IP address
 * Does not check to see if the IP already exists in the game
 */
export const createRandomIp = (): IPAddress => {
  return `${getRandomByte(99)}.${getRandomByte(9)}.${getRandomByte(9)}.${getRandomByte(9)}` as IPAddress;
};

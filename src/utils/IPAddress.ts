import type { IPAddress } from "../Types/strings";

/**
 * Generate a random IP address
 * Does not check to see if the IP already exists in the game
 */
export const createRandomIp = (): IPAddress => {
  // Credit goes to yichizhng on BitBurner discord
  // Generates a number like 0.c8f0a07f1d47e8
  const ip = Math.random().toString(16);
  // uses regex to match every 2 characters. [0.][c8][f0][a0][7f][1d][47][e8]
  // we only want #1 through #4
  const matchResult = ip.match(/../g);
  if (!matchResult) {
    // This case should never happen.
    throw new Error(`Unexpected regex matching bug in createRandomIp. ip: ${ip}`);
  }
  const sliced = matchResult.slice(1, 5);
  //convert each to a decimal number and join them together to make a human readable IP address.
  return sliced.map((x) => parseInt(x, 16)).join(".") as IPAddress;
};

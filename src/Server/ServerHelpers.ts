import { GetServer, createUniqueRandomIp, ipExists } from "./AllServers";
import { Server, IConstructorParams } from "./Server";
import { BaseServer } from "./BaseServer";
import { calculateGrowMoney, calculateServerGrowthLog } from "./formulas/grow";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { ServerConstants } from "./data/Constants";
import { Player } from "@player";
import { CompletedProgramName, LiteratureName } from "@enums";
import { Person as IPerson } from "@nsdefs";
import { Server as IServer } from "@nsdefs";
import { workerScripts } from "../Netscript/WorkerScripts";
import { killWorkerScriptByPid } from "../Netscript/killWorkerScript";
import { serverMetadata } from "./data/servers";

/**
 * Constructs a new server, while also ensuring that the new server
 * does not have a duplicate hostname/ip.
 */
export function safelyCreateUniqueServer(params: IConstructorParams): Server {
  let hostname: string = params.hostname.replace(/ /g, `-`);

  if (params.ip != null && ipExists(params.ip)) {
    params.ip = createUniqueRandomIp();
  }

  if (GetServer(hostname) != null) {
    if (hostname.slice(-2) != `-0`) {
      hostname = `${hostname}-0`;
    }

    // Use a for loop to ensure that we don't get suck in an infinite loop somehow
    for (let i = 0; i < 200; ++i) {
      hostname = hostname.replace(/-[0-9]+$/, `-${i}`);
      if (GetServer(hostname) == null) {
        break;
      }
    }
  }

  params.hostname = hostname;
  return new Server(params);
}

/**
 * Returns the number of "growth cycles" needed to grow the specified server by the specified amount, taking into
 * account only the multiplicative factor. Does not account for the additive $1/thread. Only used for growthAnalyze.
 * @param server - Server being grown
 * @param growth - How much the server is being grown by, in DECIMAL form (e.g. 1.5 rather than 50)
 * @param p - Reference to Player object
 * @returns Number of "growth cycles" needed
 */
export function numCycleForGrowth(server: IServer, growth: number, cores = 1): number {
  if (!server.serverGrowth) return Infinity;
  return Math.log(growth) / calculateServerGrowthLog(server, 1, Player, cores);
}

/**
 * This function calculates the number of threads needed to grow a server from one $amount to a higher $amount
 * (ie, how many threads to grow this server from $200 to $600 for example).
 * It protects the inputs (so putting in INFINITY for targetMoney will use moneyMax, putting in a negative for start will use 0, etc.)
 * @param server - Server being grown
 * @param targetMoney - How much you want the server grown TO (not by), for instance, to grow from 200 to 600, input 600
 * @param startMoney - How much you are growing the server from, for instance, to grow from 200 to 600, input 200
 * @param cores - Number of cores on the host performing grow
 * @returns Integer threads needed by a single ns.grow call to reach targetMoney from startMoney.
 */
export function numCycleForGrowthCorrected(
  server: IServer,
  targetMoney: number,
  startMoney: number,
  cores = 1,
  person: IPerson = Player,
): number {
  if (!server.serverGrowth) return Infinity;
  const moneyMax = server.moneyMax ?? 1;

  if (startMoney < 0) startMoney = 0; // servers "can't" have less than 0 dollars on them
  if (targetMoney > moneyMax) targetMoney = moneyMax; // can't grow a server to more than its moneyMax
  if (targetMoney <= startMoney) return 0; // no growth --> no threads

  const k = calculateServerGrowthLog(server, 1, person, cores);
  /* To understand what is done below we need to do some math. I hope the explanation is clear enough.
   * First of, the names will be shortened for ease of manipulation:
   * n:= targetMoney (n for new), o:= startMoney (o for old), k:= calculateServerGrowthLog, x:= threads
   * x is what we are trying to compute.
   *
   * After growing, the money on a server is n = (o + x) * exp(k*x)
   * x appears in an exponent and outside it, this is usually solved using the productLog/lambert's W special function,
   * but it turns out that due to floating-point range issues this approach is *useless* to us, so it will be ignored.
   *
   * Instead, we proceed directly to Newton-Raphson iteration. We first rewrite the equation in
   * log-form, since iterating it this way has faster convergence: log(n) = log(o+x) + k*x.
   * Now our goal is to find the zero of f(x) = log((o+x)/n) + k*x.
   * (Due to the shape of the function, there will be a single zero.)
   *
   * The idea of this method is to take the horizontal position at which the horizontal axis
   * intersects with of the tangent of the function's curve as the next approximation.
   * It is equivalent to treating the curve as a line (it is called a first order approximation)
   * If the current approximation is x then the new approximated value is x - f(x)/f'(x)
   * (where f' is the derivative of f).
   *
   * In our case f(x) = log((o+x)/n) + k*x, f'(x) = d(log((o+x)/n) + k*x)/dx
   *                                              = 1/(o + x) + k
   * And the update step is x[new] = x - (log((o+x)/n) + k*x)/(1/(o+x) + k)
   * We can simplify this by bringing the first term up into the fraction:
   * = (x * (1/(o+x) + k) - log((o+x)/n) - k*x) / (1/(o+x) + k)
   * = (x/(o+x) - log((o+x)/n)) / (1/(o+x) + k)    [multiplying top and bottom by (o+x)]
   * = (x - (o+x)*log((o+x)/n)) / (1 + (o+x)*k)
   *
   * The main question to ask when using this method is "does it converge?"
   * (are the approximations getting better?), if it does then it does quickly.
   * Since the derivative is always positive but also strictly decreasing, convergence is guaranteed.
   * This also provides the useful knowledge that any x which starts *greater* than the solution will
   * undershoot across to the left, while values *smaller* than the zero will continue to find
   * closer approximations that are still smaller than the final value.
   *
   * Of great importance for reducing the number of iterations is starting with a good initial
   * guess. We use a very simple starting condition: x_0 = n - o. We *know* this will always overshot
   * the target, usually by a vast amount. But we can run it manually through one Newton iteration
   * to get a better start with nice properties:
   * x_1 = ((n - o) - (n - o + o)*log((n-o+o)/n)) / (1 + (n-o+o)*k)
   *     = ((n - o) - n * log(n/n)) / (1 + n*k)
   *     = ((n - o) - n * 0) / (1 + n*k)
   *     = (n - o) / (1 + n*k)
   * We can do the same procedure with the exponential form of Newton's method, starting from x_0 = 0.
   * This gives x_1 = (n - o) / (1 + o*k), (full derivation omitted) which will be an overestimate.
   * We use a weighted average of the denominators to get the final guess:
   *   x = (n - o) / (1 + (1/16*n + 15/16*o)*k)
   * The reason for this particular weighting is subtle; it is exactly representable and holds up
   * well under a wide variety of conditions, making it likely that the we start within 1 thread of
   * correct. It particularly bounds the worst-case to 3 iterations, and gives a very wide swatch
   * where 2 iterations is good enough.
   *
   * The accuracy of the initial guess is good for many inputs - often one iteration
   * is sufficient. This means the overall cost is two logs (counting the one in calculateServerGrowthLog),
   * possibly one exp, 5 divisions, and a handful of basic arithmetic.
   */
  const guess = (targetMoney - startMoney) / (1 + (targetMoney * (1 / 16) + startMoney * (15 / 16)) * k);
  let x = guess;
  let diff;
  do {
    const ox = startMoney + x;
    // Have to use division instead of multiplication by inverse, because
    // if targetMoney is MIN_VALUE then inverting gives Infinity
    const newx = (x - ox * Math.log(ox / targetMoney)) / (1 + ox * k);
    diff = newx - x;
    x = newx;
  } while (diff < -1 || diff > 1);
  /* If we see a diff of 1 or less we know all future diffs will be smaller, and the rate of
   * convergence means the *sum* of the diffs will be less than 1.

   * In most cases, our result here will be ceil(x).
   */
  const ccycle = Math.ceil(x);
  if (ccycle - x > 0.999999) {
    // Rounding-error path: It's possible that we slightly overshot the integer value due to
    // rounding error, and more specifically precision issues with log and the size difference of
    // startMoney vs. x. See if a smaller integer works. Most of the time, x was not close enough
    // that we need to try.
    const fcycle = ccycle - 1;
    if (targetMoney <= (startMoney + fcycle) * Math.exp(k * fcycle)) {
      return fcycle;
    }
  }
  if (ccycle >= x + ((diff <= 0 ? -diff : diff) + 0.000001)) {
    // Fast-path: We know the true value is somewhere in the range [x, x + |diff|] but the next
    // greatest integer is past this. Since we have to round up grows anyway, we can return this
    // with no more calculation. We need some slop due to rounding errors - we can't fast-path
    // a value that is too small.
    return ccycle;
  }
  if (targetMoney <= (startMoney + ccycle) * Math.exp(k * ccycle)) {
    return ccycle;
  }
  return ccycle + 1;
}

//Applied server growth for a single server. Returns the percentage growth
export function processSingleServerGrowth(server: Server, threads: number, cores = 1): number {
  const oldMoneyAvailable = server.moneyAvailable;
  server.moneyAvailable = calculateGrowMoney(server, threads, Player, cores);

  // if there was any growth at all, increase security
  if (oldMoneyAvailable !== server.moneyAvailable) {
    let usedCycles = numCycleForGrowthCorrected(server, server.moneyAvailable, oldMoneyAvailable, cores);
    // Growing increases server security twice as much as hacking
    usedCycles = Math.min(Math.max(0, Math.ceil(usedCycles)), threads);
    server.fortify(2 * ServerConstants.ServerFortifyAmount * usedCycles);
  }
  return server.moneyAvailable / oldMoneyAvailable;
}

export function prestigeHomeComputer(homeComp: Server): void {
  const hasBitflume = homeComp.programs.includes(CompletedProgramName.bitFlume);

  homeComp.programs.length = 0; //Remove programs
  homeComp.serversOnNetwork = [];
  homeComp.isConnectedTo = true;
  homeComp.ramUsed = 0;
  homeComp.programs.push(CompletedProgramName.nuke);
  if (hasBitflume) {
    homeComp.programs.push(CompletedProgramName.bitFlume);
  }

  homeComp.messages.length = 0; //Remove .lit and .msg files
  homeComp.messages.push(LiteratureName.HackersStartingHandbook);
  if (homeComp.runningScriptMap.size !== 0) {
    // Temporary verbose logging section to gather data on a bug
    console.error("Some runningScripts were still present on home during prestige");
    for (const [scriptKey, byPidMap] of homeComp.runningScriptMap) {
      console.error(`script key: ${scriptKey}: ${byPidMap.size} scripts`);
      for (const pid of byPidMap.keys()) {
        if (workerScripts.has(pid)) killWorkerScriptByPid(pid);
      }
      byPidMap.clear();
    }
    homeComp.runningScriptMap.clear();
  }
}

// Returns the i-th server on the specified server's network
// A Server's serverOnNetwork property holds only the IPs. This function returns
// the actual Server object
export function getServerOnNetwork(server: BaseServer, i: number): BaseServer | null {
  if (i > server.serversOnNetwork.length) {
    console.error("Tried to get server on network that was out of range");
    return null;
  }

  return GetServer(server.serversOnNetwork[i]);
}

export function isBackdoorInstalled(server: BaseServer): boolean {
  if (server instanceof Server) {
    return server.backdoorInstalled;
  }
  return false;
}

export function isBackdoorInstalledInCompanyServer(companyName: string): boolean {
  const serverMeta = serverMetadata.find((s) => s.specialName === companyName);
  const server = GetServer(serverMeta ? serverMeta.hostname : "");
  if (!server) {
    return false;
  }
  return isBackdoorInstalled(server);
}

export function getCoreBonus(cores = 1): number {
  const coreBonus = 1 + (cores - 1) / 16;
  return coreBonus;
}

export function getWeakenEffect(threads: number, cores: number): number {
  const coreBonus = getCoreBonus(cores);
  return ServerConstants.ServerWeakenAmount * threads * coreBonus * currentNodeMults.ServerWeakenRate;
}

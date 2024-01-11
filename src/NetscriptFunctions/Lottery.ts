import type { InternalAPI } from "../Netscript/APIWrapper";
import { LotteryConstants } from "../Lottery/data/LotteryConstants";
import { Player } from "@player";
import { Lottery as ILottery } from "@nsdefs";
import { TicketRecord, GameType, GameOptions } from "../Lottery/LotteryStoreLocationInside";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { isNumber, cloneDeep } from "lodash";

export function NetscriptLottery(): InternalAPI<ILottery> {
  const isValidNumbers = function (numbers: any[]): boolean {
    if (numbers.length === 0) {
      return false;
    }
    for (const num of numbers) {
      if (!isNumber(num)) {
        return false;
      }
    }
    return true;
  };
  const isUniqueNumbers = function (numbers: any[]): boolean {
    if (numbers.length === 0) {
      return false;
    }
    let unique = 0;
    for (const num of numbers) {
      if (numbers.filter((n) => n === num).length > unique) {
        unique = numbers.filter((n) => n === num).length;
      }
    }
    return unique === 1 ? true : false;
  };

  return {
    getTickets: () => () => cloneDeep(Player?.lotteryTickets),
    buyPick2Ticket: () => (_wager, _numbers) => {
      const wagerthere = !!_wager;
      const numbersthere = !!_numbers;
      let wager = 0;
      if (!wagerthere || !numbersthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      //Get our numbers.
      const numbers: number[] = [];
      if (!Array.isArray(_numbers) || !isValidNumbers(_numbers)) {
        return false;
      }
      //Buffer with 0's if needed
      if (_numbers.length === 1) {
        numbers.push(0);
        numbers.push(_numbers[0]);
      } else if (_numbers.length === 2) {
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
      } else {
        //Throw error?
        return false;
      }

      const ticket = new TicketRecord(GameType.Pick2, numbers, wager, GameOptions.Straight);
      Player.lotteryTickets.push(ticket);
      Player.loseMoney(wager, "lottery");
      return true;
    },
    buyPick3Ticket: () => (_wager, _option, _numbers) => {
      const wagerthere = !!_wager;
      const numbersthere = !!_numbers;
      const optionthere = !!_option;
      let wager = 0;
      if (!wagerthere || !numbersthere || !optionthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      //Get our numbers.
      const numbers: number[] = [];
      if (!Array.isArray(_numbers) || !isValidNumbers(_numbers)) {
        return false;
      }
      //Buffer with 0's if needed, no length of 0 allowed in isValidNumbers
      if (_numbers.length === 1) {
        numbers.push(0);
        numbers.push(0);
        numbers.push(_numbers[0]);
      } else if (_numbers.length === 2) {
        numbers.push(0);
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
      } else if (_numbers.length === 3) {
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
        numbers.push(_numbers[2]);
      } else {
        //Throw error?
        return false;
      }
      // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/3 must be unique.  Straight/box 2/3 must be unique
      if (_option === "straight") {
        const ticket = new TicketRecord(GameType.Pick3, numbers, wager, GameOptions.Straight);
        Player.lotteryTickets.push(ticket);
        Player.loseMoney(wager, "lottery");
        return true;
      }
      //We have a box or straight/box.  Check it for unique numbers.
      let unique = 0;
      for (const num of numbers) {
        if (numbers.filter((n) => n === num).length > unique) {
          unique = numbers.filter((n) => n === num).length;
        }
      }
      if (unique === 3) {
        return false;
      } else if (_option === "box") {
        const ticket = new TicketRecord(GameType.Pick3, numbers, wager, GameOptions.Box);
        Player.lotteryTickets.push(ticket);
        Player.loseMoney(wager, "lottery");
        return true;
      } else if (_option === "straightbox" || _option === "straight/box") {
        const ticket = new TicketRecord(GameType.Pick3, numbers, wager, GameOptions.StraightBox);
        Player.lotteryTickets.push(ticket);
        Player.loseMoney(wager, "lottery");
        return true;
      }
      //?????  Must have gotten the boxtype wrong or something.
      return false;
    },
    buyPick4Ticket: () => (_wager, _option, _numbers) => {
      const wagerthere = !!_wager;
      const numbersthere = !!_numbers;
      const optionthere = !!_option;
      let wager = 0;
      if (!wagerthere || !numbersthere || !optionthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      //Get our numbers.
      const numbers: number[] = [];
      if (!Array.isArray(_numbers) || !isValidNumbers(_numbers)) {
        return false;
      }
      //Buffer with 0's if needed, no length of 0 allowed in isValidNumbers
      if (_numbers.length === 1) {
        numbers.push(0);
        numbers.push(0);
        numbers.push(0);
        numbers.push(_numbers[0]);
      } else if (_numbers.length === 2) {
        numbers.push(0);
        numbers.push(0);
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
      } else if (_numbers.length === 3) {
        numbers.push(0);
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
        numbers.push(_numbers[2]);
      } else if (_numbers.length === 4) {
        numbers.push(_numbers[0]);
        numbers.push(_numbers[1]);
        numbers.push(_numbers[2]);
        numbers.push(_numbers[3]);
      } else {
        //Throw error?
        return false;
      }
      // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/4 must be unique.
      if (_option === "straight") {
        const ticket = new TicketRecord(GameType.Pick4, numbers, wager, GameOptions.Straight);
        Player.lotteryTickets.push(ticket);
        Player.loseMoney(wager, "lottery");
        return true;
      }
      //We have a box or straight/box.  Check it for unique numbers.
      let unique = 0;
      for (const num of numbers) {
        if (numbers.filter((n) => n === num).length > unique) {
          unique = numbers.filter((n) => n === num).length;
        }
      }
      if (unique === 4) {
        return false;
      } else if (_option === "box") {
        const ticket = new TicketRecord(GameType.Pick4, numbers, wager, GameOptions.Box);
        Player.lotteryTickets.push(ticket);
        Player.loseMoney(wager, "lottery");
        return true;
      }
      //?????  Must have gotten the boxtype wrong or something.
      return false;
    },
    buyKenoTicket: () => (_wager, _numbers) => {
      const wagerthere = !!_wager;
      const numbersthere = !!_numbers;
      let wager = 0;

      if (!wagerthere || !numbersthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      //Get our numbers.
      if (!Array.isArray(_numbers) || !isValidNumbers(_numbers) || !isUniqueNumbers(_numbers) || _numbers.length > 10) {
        return false;
      }

      // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/4 must be unique.
      const ticket = new TicketRecord(GameType.Keno, _numbers, wager, GameOptions.None);
      Player.lotteryTickets.push(ticket);
      Player.loseMoney(wager, "lottery");
      return true;
    },
    buyL649Ticket: () => (_wager, _numbers) => {
      const wagerthere = !!_wager;
      const numbersthere = !!_numbers;
      let wager = 0;

      if (!wagerthere || !numbersthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      //Get our numbers.
      if (
        !Array.isArray(_numbers) ||
        !isValidNumbers(_numbers) ||
        !isUniqueNumbers(_numbers) ||
        _numbers.length !== 6
      ) {
        return false;
      }

      // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/4 must be unique.
      const ticket = new TicketRecord(GameType.L649, _numbers, wager, GameOptions.None);
      Player.lotteryTickets.push(ticket);
      Player.loseMoney(wager, "lottery");
      return true;
    },
    buyRandomTicket: () => (_wager, _type, _option) => {
      const wagerthere = !!_wager;
      const typethere = !!_type;
      const optionthere = !!_option;
      let wager = 0;

      if (!wagerthere || Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
        return false;
      }
      if (isNumber(_wager)) {
        wager = _wager;
      } else {
        return false;
      }

      if (wager < LotteryConstants.MinPlay || wager > LotteryConstants.MaxPlay) {
        return false;
      }
      //We have a valid wager.

      let type = "";
      let gtype = GameType.None;
      let rnd = getRandomInt(1, 5);
      if (typethere) {
        type = String(_type).toLowerCase();
        switch (type) {
          case "pick2":
            gtype = GameType.Pick2;
            break;
          case "pick3":
            gtype = GameType.Pick3;
            break;
          case "pick4":
            gtype = GameType.Pick4;
            break;
          case "keno":
            gtype = GameType.Keno;
            break;
          case "l649":
            gtype = GameType.L649;
            break;
          case "random":
            gtype =
              rnd === 1
                ? GameType.Pick2
                : rnd === 2
                ? GameType.Pick3
                : rnd === 3
                ? GameType.Pick4
                : rnd === 4
                ? GameType.Keno
                : GameType.L649;
            break;
          default:
            return false;
        }
      } else {
        switch (getRandomInt(1, 5)) {
          case 1:
            gtype = GameType.Pick2;
            break;
          case 2:
            gtype = GameType.Pick3;
            break;
          case 3:
            gtype = GameType.Pick4;
            break;
          case 4:
            gtype = GameType.Keno;
            break;
          case 5:
            gtype = GameType.L649;
            break;
        }
      }
      // Type aquired.  Need options.
      let option = "";
      let opt = GameOptions.None;
      let kenonums = 0;
      rnd = getRandomInt(1, 3);
      if (gtype === GameType.Keno && isNumber(_option)) {
        kenonums = _option;
      } else {
        if (optionthere) {
          option = String(_option);
          switch (option) {
            case "box":
              opt = GameOptions.Box;
              break;
            case "straight":
              opt = GameOptions.Straight;
              break;
            case "straightbox":
            case "straight/box":
              opt = GameOptions.StraightBox;
              break;
            case "random":
              switch (gtype) {
                case GameType.Pick2:
                  opt = GameOptions.Straight;
                  break;
                case GameType.Pick3:
                  opt = rnd === 1 ? GameOptions.Straight : rnd === 2 ? GameOptions.Box : GameOptions.StraightBox;
                  break;
                case GameType.Pick4:
                  opt = getRandomInt(1, 2) === 1 ? GameOptions.Straight : (opt = GameOptions.Box);
                  break;
                case GameType.Keno:
                case GameType.L649:
                  opt = GameOptions.None;
                  break;
              }
              break;
            default:
              return false;
          }
        } else {
          switch (gtype) {
            case GameType.Pick2:
              opt = GameOptions.Straight;
              break;
            case GameType.Pick3:
              opt = rnd === 1 ? GameOptions.Straight : rnd === 2 ? GameOptions.Box : GameOptions.StraightBox;
              break;
            case GameType.Pick4:
              opt = getRandomInt(1, 2) === 1 ? GameOptions.Straight : (opt = GameOptions.Box);
              break;
            case GameType.Keno:
            case GameType.L649:
              opt = GameOptions.None;
              break;
          }
        }
      }

      // Need numbers.
      const numbers: number[] = [];

      switch (gtype) {
        case GameType.Pick2:
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          break;
        case GameType.Pick3:
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          break;
        case GameType.Pick4:
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          break;
        case GameType.L649:
          numbers.push(getRandomInt(1, 49));
          while (numbers.length < 6) {
            const num = getRandomInt(1, 49);
            if (!numbers.includes(num)) {
              numbers.push(num);
            }
          }
          break;
        case GameType.Keno:
          if (kenonums === 0) {
            kenonums = getRandomInt(1, 10);
          }
          if (optionthere && isNumber(_option) && _option > 0 && _option < 11) {
            kenonums = _option;
          }
          numbers.push(getRandomInt(1, 80));
          while (numbers.length < kenonums) {
            const num = getRandomInt(1, 80);
            if (!numbers.includes(num)) {
              numbers.push(num);
            }
          }
          break;
      }

      // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/4 must be unique.
      const ticket = new TicketRecord(gtype, numbers, wager, opt);
      Player.lotteryTickets.push(ticket);
      Player.loseMoney(wager, "lottery");
      return true;
    },
  };
}

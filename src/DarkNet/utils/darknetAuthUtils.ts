import { canAccessBitNodeFeature } from "../../BitNode/BitNodeUtils";
import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { GenericResponseMessage, ResponseCodeEnum } from "../Enums";

export const hasDarknetAccess = () => {
  return canAccessBitNodeFeature(15) || Player.hasProgram(CompletedProgramName.darkscape);
};

export const getTwoCharsInPassword = (password: string) => {
  const index1 = Math.floor(Math.random() * password.length);
  const containedChar1 = password[index1];
  let index2 = Math.floor(Math.random() * password.length);
  if (index2 === index1) {
    index2 = (index2 + 1) % password.length;
  }
  const containedChar2 = password[index2];
  return [containedChar1, containedChar2];
};

export const getExactCorrectChars = (password: string, attemptedPassword: string) =>
  password.split("").map((digit, i: number) => digit === attemptedPassword[i]);

export const getExactCorrectCharsCount = (password: string, attemptedPassword: string) =>
  getExactCorrectChars(password, attemptedPassword).filter((isCorrect) => isCorrect).length;

export const getSharedChars = (password: string, attemptedPassword: string): number => {
  for (let i = 0; i < password.length; i++) {
    if (password[i] !== attemptedPassword[i]) {
      return i;
    }
  }
  return password.length;
};

export const getMisplacedCorrectCharsCount = (password: string, attemptedPassword: string) => {
  // filter out exact correct chars from both the attempted and correct password, to simplify checking for duplicate counts
  const remainingPasswordChars = password.split("").filter((digit, i) => digit !== attemptedPassword[i]);
  const remainingAttemptedPasswordChars = attemptedPassword.split("").filter((digit, i) => digit !== password[i]);

  const misplacedCorrectChars = remainingAttemptedPasswordChars.filter((digit, i) => {
    const isPresentInPassword = remainingPasswordChars.includes(digit);
    const countInAttemptedPasswordThusFar = remainingAttemptedPasswordChars
      .slice(0, i)
      .filter((prevDigit) => prevDigit === digit).length;
    const countInPassword = remainingPasswordChars.filter((prevDigit) => prevDigit === digit).length;
    return isPresentInPassword && countInAttemptedPasswordThusFar < countInPassword;
  });

  return misplacedCorrectChars.length;
};

export const getGenericSuccess = (attemptedPassword: string) => ({
  code: ResponseCodeEnum.Success,
  message: GenericResponseMessage.Success,
  passwordAttempted: attemptedPassword,
});

export const getFailureResponse = (attemptedPassword: string, message: string, data: string) => ({
  code: ResponseCodeEnum.AuthFailure,
  message,
  data,
  passwordAttempted: attemptedPassword,
});

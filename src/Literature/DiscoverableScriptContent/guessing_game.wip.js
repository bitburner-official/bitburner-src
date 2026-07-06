/*
                    Interview Assignment: Junie "Jumper" Perez
              (c) 2063 Ishima Storm Technologies. All Rights Reserved.


   > I cant believe they're making me actually do a coding test. What is this, some kind of joke?
   > They're asking me - with a full set of Neurolink augments and half the net under my control -
   > to make an "interactive experience"?
   >
   > And then they have the gall to say they will own the IP of whatever I make??
   >
   > There's no way they even have the connections to Tian Di Hui through Ishima that I'm looking for.
   >
   > Whatever. Hope you like pop-up prompts. I'm not even going to bother testing this before submitting it.
*/

/** @param {NS} ns */
export async function main(ns) {
  const maxRange = 10;
  const correctAnswer = `${Math.floor(Math.random() * maxRange) + 1}`;

  let playerGuess = 0;
  let guessCount = 0;

  while (true) {
    const feedback = getFeedbackString(playerGuess, correctAnswer);
    playerGuess = await ns.prompt(`${feedback}Guess a number between 1 and ${maxRange}!`, { type: 'text' });
    guessCount++;

    if (playerGuess === '') {
      ns.tprint('Game exited.');
      ns.exit();
    }
  }
  ns.alert(`Correct! The answer was ${correctAnswer}.\nYou found it in ${guessCount} guesses.`);
}

function getFeedbackString(guess, answer) {
  if (!guess) {
    return '';
  }
  if (guess < answer) {
    return `${guess} is too low.\n`;
  }
  return `${guess} is too high.\n`;
}

import type { Board, BoardState, PointState } from "../Types";

import { GoColor } from "@enums";
import {
  getAllChains,
  getAllEyes,
  getAllNeighboringChains,
  getAllPotentialEyes,
  getAllValidMoves,
} from "./boardAnalysis";
import { contains, isNotNullish } from "../boardState/boardState";

/**
 * Any empty space fully encircled by the opponent is not worth playing in, unless one of its borders explicitly has a weakness
 *
 * Specifically, ignore any empty space encircled by the opponent, unless one of the chains that is on the exterior:
 *   * does not have too many more liberties
 *   * has been fully encircled on the outside by the current player
 *   * Only has liberties remaining inside the abovementioned empty space
 *
 * In which case, only the liberties of that one weak chain are worth considering. Other parts of that fully-encircled
 * enemy space, and other similar spaces, should be ignored, otherwise the game drags on too long
 */
export function findDisputedTerritory(boardState: BoardState, player: GoColor, excludeFriendlyEyes?: boolean) {
  let validMoves = getAllValidMoves(boardState, player);
  if (excludeFriendlyEyes) {
    const friendlyEyes = getAllEyes(boardState.board, player)
      .filter((eye) => eye.length >= 2)
      .flat()
      .flat();
    validMoves = validMoves.filter((point) => !contains(friendlyEyes, point));
  }
  const opponent = player === GoColor.white ? GoColor.black : GoColor.white;
  const chains = getAllChains(boardState.board);
  const emptySpacesToAnalyze = getAllPotentialEyes(boardState.board, chains, opponent);
  const nodesInsideEyeSpacesToAnalyze = emptySpacesToAnalyze.map((space) => space.chain).flat();

  const playableNodesInsideOfEnemySpace = emptySpacesToAnalyze.reduce((playableNodes: PointState[], space) => {
    // Look for any opponent chains on the border of the empty space, to see if it has a weakness
    const attackableLiberties = space.neighbors
      .map((neighborChain) => {
        const liberties = neighborChain[0].liberties ?? [];

        // Ignore border chains with too many liberties, they can't effectively be attacked
        if (liberties.length > 4) {
          return [];
        }

        // Get all opponent chains that make up the border of the opponent-controlled space
        const neighborChains = getAllNeighboringChains(boardState.board, neighborChain, chains);

        // Ignore border chains that do not touch the current player's pieces somewhere, as they are likely fully interior
        // to the empty space in question, or only share a border with the edge of the board and the space, or are not yet
        // surrounded on the exterior and ready to be attacked within
        if (!neighborChains.find((chain) => chain?.[0]?.color === player)) {
          return [];
        }

        const libertiesInsideOfSpaceToAnalyze = liberties
          .filter(isNotNullish)
          .filter((point) => contains(space.chain, point));

        // If the chain has any liberties outside the empty space being analyzed, it is not yet fully surrounded,
        // and should not be attacked yet
        if (libertiesInsideOfSpaceToAnalyze.length !== liberties.length) {
          return [];
        }

        // If the enemy chain is fully surrounded on the outside of the space by the current player, then its liberties
        // inside the empty space is worth considering for an attack
        return libertiesInsideOfSpaceToAnalyze;
      })
      .flat();

    return [...playableNodes, ...attackableLiberties];
  }, []);

  // Return only valid moves that are not inside enemy surrounded empty spaces, or ones that are explicitly next to an enemy chain that can be attacked
  return validMoves.filter(
    (move) => !contains(nodesInsideEyeSpacesToAnalyze, move) || contains(playableNodesInsideOfEnemySpace, move),
  );
}

/**
 If a group of stones has more than one empty holes that it completely surrounds, it cannot be captured, because white can
 only play one stone at a time.
 Thus, the empty space of those holes is firmly claimed by the player surrounding them, and it can be ignored as a play area
 Once all points are either stones or claimed territory in this way, the game is over

 Note that this does not detect mutual eyes formed by two chains making an eye together, or eyes via seki, or some other edge cases.
 */
export function findClaimedTerritory(board: Board) {
  const whiteClaimedTerritory = getAllEyes(board, GoColor.white).filter((eyesForChainN) => eyesForChainN.length >= 2);
  const blackClaimedTerritory = getAllEyes(board, GoColor.black).filter((eyesForChainN) => eyesForChainN.length >= 2);
  return [...blackClaimedTerritory, ...whiteClaimedTerritory].flat().flat();
}

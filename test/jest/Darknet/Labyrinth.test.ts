import { generateMaze } from "../../../src/DarkNet/effects/labyrinth";

describe("Labyrinth Tests", () => {
  it("should create a maze with the correct size", () => {
    const width = 30;
    const height = 20;
    const maze = generateMaze(width, height);

    // console.log(
    //   maze
    //     .map((row) =>
    //       row
    //         .split("")
    //         .map((x) => `${x}${x}`)
    //         .join(""),
    //     )
    //     .join("\n"),
    // );

    // console.log(getSurroundingsVisualized(maze, 1, 1));

    expect(maze).toHaveLength(height + 1);
    expect(maze[0]).toHaveLength(width - 1);
  });
});

type Rock = "👊🏻";
type Paper = "🖐🏾";
type Scissors = "✌🏽";
type RockPaperScissors = Rock | Paper | Scissors;

type Win = "win";
type Lose = "lose";
type Draw = "draw";

type WhoWins<First extends RockPaperScissors, Second extends RockPaperScissors> = [First, Second] extends
  | [Rock, Scissors]
  | [Scissors, Paper]
  | [Paper, Rock]
  ? Lose
  : [First, Second] extends [Second, First]
  ? Draw
  : Win;

export {};

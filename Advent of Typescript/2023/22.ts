/** because "dashing" implies speed */
type Dasher = "💨";

/** representing dancing or grace */
type Dancer = "💃";

/** a deer, prancing */
type Prancer = "🦌";

/** a star for the dazzling, slightly mischievous Vixen */
type Vixen = "🌟";

/** for the celestial body that shares its name */
type Comet = "☄️";

/** symbolizing love, as Cupid is the god of love */
type Cupid = "❤️";

/** representing thunder, as "Donner" means thunder in German */
type Donner = "🌩️";

/** meaning lightning in German, hence the lightning bolt */
type Blitzen = "⚡";

/** for his famous red nose */
type Rudolph = "🔴";

type Reindeer = Dasher | Dancer | Prancer | Vixen | Comet | Cupid | Donner | Blitzen | Rudolph;

type TupleIndicies<Tuple extends any[]> = keyof Tuple & `${number}`;
type SudokuRegionRow = [Reindeer, Reindeer, Reindeer];
type SudokuRow = [SudokuRegionRow, SudokuRegionRow, SudokuRegionRow];
type SudokuRowTrio = [SudokuRow, SudokuRow, SudokuRow];
type SudokuGrid = [...SudokuRowTrio, ...SudokuRowTrio, ...SudokuRowTrio];
type RowIndex = TupleIndicies<SudokuGrid>;
type SubgridIndex = TupleIndicies<SudokuRow>;

type UnionToIntersection<U> = (U extends U ? (arg: U) => void : never) extends (
  arg: infer I extends U
) => void
  ? I
  : never;

type GetRowValues<Grid extends SudokuGrid, $RI extends RowIndex = RowIndex> = UnionToIntersection<
  $RI extends $RI ? [Grid[$RI & keyof Grid][SubgridIndex][SubgridIndex]] : never
>[0];

type GetColValues<
  Grid extends SudokuGrid,
  $CI extends SubgridIndex = SubgridIndex,
  $SI extends SubgridIndex = SubgridIndex
> = UnionToIntersection<$CI extends $CI ? ($SI extends $SI ? [Grid[RowIndex][$CI][$SI]] : never) : never>[0];

type GetSubgridTrioValues<
  Trio extends SudokuRowTrio,
  $CI extends SubgridIndex = SubgridIndex
> = UnionToIntersection<$CI extends $CI ? [Trio[$CI][SubgridIndex][SubgridIndex]] : never>[0];

type GetSubgridValues<Grid> = Grid extends [
  infer A extends SudokuRow,
  infer B extends SudokuRow,
  infer C extends SudokuRow,
  ...infer R
]
  ? GetSubgridTrioValues<[A, B, C]> & GetSubgridValues<R>
  : unknown;

type Validate<Grid extends SudokuGrid> = Reindeer extends GetSubgridValues<Grid> &
  GetRowValues<Grid> &
  GetColValues<Grid>
  ? true
  : false;

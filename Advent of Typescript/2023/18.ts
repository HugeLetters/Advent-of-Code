type FuncUnion<U> = U extends U ? (x: U) => 0 : never;
type UnionToIntersection<U> = [U] extends [(x: infer I) => 0] ? I : never;
type LastInUnion<U> = UnionToIntersection<UnionToIntersection<FuncUnion<FuncUnion<U>>>>;

type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last];

type FilterObject<O, V> = { [K in keyof O as O[K] extends V ? K : never]: O[K] };

type Count<A, V> = UnionToTuple<keyof FilterObject<A, V>>["length"];

export {};

import type fr from "./fr";

type DeepStringify<T> = T extends string
  ? string
  : { [K in keyof T]: DeepStringify<T[K]> };

export type Dictionary = DeepStringify<typeof fr>;

export type Locale = "fr" | "en";

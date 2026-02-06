export type BaseRequirement = {
  title: string;
  requirement: number;
};

export type LevelRequirements =
  | BaseRequirement
  | {
      OR: BaseRequirement[];
      AND: BaseRequirement[];
    };

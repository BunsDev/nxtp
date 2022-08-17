import { Config } from "./config";

export type AppContext = {
  config: Config;
};

export let context: AppContext = {} as any;

export const getContext = (): AppContext => context;

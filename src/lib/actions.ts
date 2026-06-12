'use server';

import { corsair } from "~/server/corsair";
import { api } from "~/trpc/server";

export const test = async () => {
  const result = await api.test.test();
  console.log(result);
};

export const syncCorsair = async () => {
  const result = await api.corsair.sync();
  console.log(result);
  return result;
};

export const createUserForCorsair = async () => {
  const result = await api.corsair.createId();
  console.log(result);
  return result;
};
import { defineStore } from "pinia";

export const useComputeStore = defineStore("computeStore", {
  state: () => ({
    computing: false,
  }),
});

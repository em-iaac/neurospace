import { createPinia } from "pinia";
import { useComputeStore } from "./computeStore";

const store = useComputeStore(createPinia());
export { store };

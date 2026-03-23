import systemJson from "../../data/fidelity/system.json";
import type { FidelitySystemFile } from "./fidelityTypes";

/** Full fidelity system bundle (suits, numbers, journey, etc.). Loaded by `/system` and code-split from the main chunk. */
export const fidelitySystem: FidelitySystemFile = systemJson as FidelitySystemFile;

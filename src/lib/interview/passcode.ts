"use client";
/** The interview passcode, remembered on this device. Shared by every AI feature. */
export const PASS_KEY = "uncooked:interview-passcode";
export const readPass = (): string => {
  try {
    return localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    return "";
  }
};
export const writePass = (v: string) => {
  try {
    if (v) localStorage.setItem(PASS_KEY, v);
    else localStorage.removeItem(PASS_KEY);
  } catch {
    /* storage blocked: just not remembered */
  }
};

import { beforeEach, describe, expect, it } from "vitest";
import {
  HOUSEHOLD_STORAGE_KEY,
  LEGACY_PARTICIPANT_STORAGE_KEY,
  loadHousehold,
  saveHousehold,
} from "./db";

describe("Household storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads an empty Household when nothing is stored", () => {
    expect(loadHousehold()).toEqual([]);
  });

  it("round-trips a Household", () => {
    saveHousehold(["PREGNANT", "INFANT_6_12"]);
    expect(loadHousehold()).toEqual(["PREGNANT", "INFANT_6_12"]);
  });

  it("drops duplicate and unknown Participant Categories", () => {
    saveHousehold(["PREGNANT", "PREGNANT", "NOT_A_TYPE" as never, "CHILD_1_2"]);
    expect(loadHousehold()).toEqual(["PREGNANT", "CHILD_1_2"]);
  });

  it("migrates a Household stored under the legacy single-participant key", () => {
    localStorage.setItem(LEGACY_PARTICIPANT_STORAGE_KEY, "CHILD_2_5");
    expect(loadHousehold()).toEqual(["CHILD_2_5"]);
  });

  it("prefers the Household key over the legacy key", () => {
    localStorage.setItem(LEGACY_PARTICIPANT_STORAGE_KEY, "CHILD_2_5");
    localStorage.setItem(HOUSEHOLD_STORAGE_KEY, JSON.stringify(["POSTPARTUM"]));
    expect(loadHousehold()).toEqual(["POSTPARTUM"]);
  });

  it("removes the legacy key on save", () => {
    localStorage.setItem(LEGACY_PARTICIPANT_STORAGE_KEY, "CHILD_2_5");
    saveHousehold(["PREGNANT", "INFANT_6_12"]);
    expect(localStorage.getItem(LEGACY_PARTICIPANT_STORAGE_KEY)).toBeNull();
    expect(loadHousehold()).toEqual(["PREGNANT", "INFANT_6_12"]);
  });

  it("clears storage when saving an empty Household", () => {
    saveHousehold(["PREGNANT"]);
    localStorage.setItem(LEGACY_PARTICIPANT_STORAGE_KEY, "PREGNANT");
    saveHousehold([]);
    expect(localStorage.getItem(HOUSEHOLD_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_PARTICIPANT_STORAGE_KEY)).toBeNull();
    expect(loadHousehold()).toEqual([]);
  });
});

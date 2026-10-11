import { describe, expect, test } from "bun:test";
import { coinFrame, COIN_IMPACTS, shouldCelebrateSave } from "./coin-timeline";

describe("celebración de multas", () => {
  test("aparece al añadir una multa guardada", () => expect(shouldCelebrateSave(true, "create")).toBe(true));
  test("aparece al editar una multa guardada", () => expect(shouldCelebrateSave(true, "edit")).toBe(true));
  test("no aparece si falla el guardado", () => {
    expect(shouldCelebrateSave(false, "create")).toBe(false);
    expect(shouldCelebrateSave(false, "edit")).toBe(false);
  });
  test("las monedas entran en la hucha en los golpes del MP3", () => {
    expect(COIN_IMPACTS).toEqual([0.39, 0.67, 2.52]);
    COIN_IMPACTS.forEach((impact, index) => {
      expect(coinFrame(impact - 0.01).coins[index]?.visible).toBe(true);
      expect(coinFrame(impact).coins[index]?.progress).toBe(1);
      expect(coinFrame(impact).coins[index]?.visible).toBe(false);
      expect(coinFrame(impact + 0.16).bounce).toBeCloseTo(1);
    });
  });
});
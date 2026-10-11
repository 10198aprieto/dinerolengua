import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { coinFrame, COIN_IMPACTS, shouldCelebrateSave } from "./coin-timeline";

describe("celebración de multas", () => {
  test("aparece al añadir una multa guardada", () => assert.equal(shouldCelebrateSave(true, "create"), true));
  test("aparece al editar una multa guardada", () => assert.equal(shouldCelebrateSave(true, "edit"), true));
  test("no aparece si falla el guardado", () => {
    assert.equal(shouldCelebrateSave(false, "create"), false);
    assert.equal(shouldCelebrateSave(false, "edit"), false);
  });
  test("las monedas entran en la hucha en los golpes del MP3", () => {
    assert.deepEqual(COIN_IMPACTS, [0.39, 0.67, 2.52]);
    COIN_IMPACTS.forEach((impact, index) => {
      assert.equal(coinFrame(impact - 0.01).coins[index]?.visible, true);
      assert.equal(coinFrame(impact).coins[index]?.progress, 1);
      assert.equal(coinFrame(impact).coins[index]?.visible, false);
      assert.ok(Math.abs(coinFrame(impact + 0.16).bounce - 1) < 0.001);
    });
  });
});
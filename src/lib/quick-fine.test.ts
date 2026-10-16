import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { quickFinePayload, QUICK_FINE_CENTS } from "./quick-fine";

const student = { id: "11111111-1111-4111-8111-111111111111", full_name: "Karen Vithoria", class_name: "4ºA" };
const payload = quickFinePayload("22222222-2222-4222-8222-222222222222", student, "2026-10-16");

describe("acceso rápido de 10 céntimos", () => {
  test("anota exactamente 10 céntimos", () => assert.equal(payload.amount_cents, 10));
  test("la multa queda pendiente de pago", () => assert.equal(payload.is_paid, false));
  test("se apunta al alumno y a la clase de esa persona", () => {
    assert.equal(payload.student_id, student.id);
    assert.equal(payload.student_name, "Karen Vithoria");
    assert.equal(payload.class_name, "4ºA");
  });
  test("usa la fecha de hoy y el profesor que guarda", () => {
    assert.equal(payload.occurred_on, "2026-10-16");
    assert.equal(payload.teacher_id, "22222222-2222-4222-8222-222222222222");
  });
  test("el importe cumple el límite de la hucha", () => {
    assert.ok(QUICK_FINE_CENTS > 0 && QUICK_FINE_CENTS <= 100000);
  });
});

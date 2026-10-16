export const QUICK_FINE_CENTS = 10;

export type QuickFineStudent = { id: string; full_name: string; class_name: string };

export function quickFinePayload(teacherId: string, student: QuickFineStudent, occurredOn: string) {
  return {
    teacher_id: teacherId,
    class_name: student.class_name,
    student_name: student.full_name,
    student_id: student.id,
    amount_cents: QUICK_FINE_CENTS,
    occurred_on: occurredOn,
    is_paid: false,
    notes: null,
  };
}

const BRAND_LOGO_URL = "https://dinerolengua.lovable.app/la-hucha-de-lengua.svg";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });

const shell = (greeting: string, content: string, footer: string) => `
<!doctype html>
<html lang="es">
  <body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#171717;">
    <div style="max-width:680px;margin:0 auto;padding:42px 28px 48px;line-height:1.45;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
        <tr>
          <td style="width:150px;vertical-align:middle;">
            <img src="${BRAND_LOGO_URL}" width="118" alt="Maristas Centro Cultural Vallisoletano" style="display:block;width:118px;height:auto;border:0;" />
          </td>
          <td style="vertical-align:middle;">
            <h1 style="margin:0;color:#70ad47;font-size:25px;line-height:1.2;font-weight:700;">La Hucha de Lengua</h1>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 28px;font-size:16px;">${greeting}</p>
      <div style="font-size:16px;">${content}</div>
      <p style="margin:22px 0 0;color:#a3a3a3;font-size:13px;">Centro Cultural Vallisoletano · 3.º/4.º ESO</p>
      <p style="margin:48px 0 0;color:#a3a3a3;font-size:12px;line-height:1.45;">${footer}</p>
    </div>
  </body>
</html>`;

const automatedNotice =
  "Este correo se envía desde un sistema automatizado mediante <em>ReSend for Developers</em>, conectado con registros DNS al dominio dinerolengua.es. Este correo lleva incluida una trazabilidad mediante la cual el administrador del dominio puede ver a quién se envía y qué contiene dicho correo. <strong>Por favor, no responda este correo electrónico, ya que el remitente no acepta respuestas. Gracias.</strong>";

export function studentReminderEmail(studentName: string, className: string, owedCents: number) {
  const safeName = escapeHtml(studentName);
  const safeClass = escapeHtml(className);
  return shell(
    `Hola, <strong>${safeName}</strong>:`,
    `<p style="margin:0 0 14px;">Te recordamos que tienes pendiente <strong>${money(owedCents)}</strong> en la hucha de Lengua de <strong>${safeClass}</strong>.</p>
     <p style="margin:0 0 18px;">Recuerda que, si no lo pagas en la última clase de Lengua de la semana, se te sumarán <strong>0,10 €</strong> en concepto de demora.</p>
     <p style="margin:0;"><strong>¡Cada palabra cuenta!</strong></p>`,
    `Has recibido este correo por estar inscrito en la lista de alumnos de “La Hucha de Lengua” en la clase ${safeClass}. ${automatedNotice}`,
  );
}

export type TeacherClassSummary = {
  className: string;
  students: Array<{ name: string; owed: number }>;
};

export function teacherSummaryEmail(teacherName: string, summaries: TeacherClassSummary[]) {
  const sections = summaries
    .map(({ className, students }) => {
      const total = students.reduce((sum, student) => sum + student.owed, 0);
      const list = students.length
        ? `<ul style="margin:8px 0 10px;padding-left:22px;">${students.map((student) => `<li style="margin:4px 0;">${escapeHtml(student.name)}: <strong>${money(student.owed)}</strong></li>`).join("")}</ul><p style="margin:0 0 18px;">Total pendiente: <strong>${money(total)}</strong></p>`
        : `<p style="margin:8px 0 18px;">Nadie debe dinero.</p>`;
      return `<h2 style="margin:20px 0 0;color:#70ad47;font-size:19px;">${escapeHtml(className)}</h2>${list}`;
    })
    .join("");

  return shell(
    `Hola, <strong>${escapeHtml(teacherName)}</strong>:`,
    `<p style="margin:0 0 14px;">Aquí tiene el resumen semanal de “La Hucha de Lengua”:</p>
     ${sections}
     <p style="margin:28px 0 18px;"><strong>Recuerde añadir 0,10 € a quien hoy no abone su deuda (este añadido es en concepto de demora).</strong></p>
     <p style="margin:0;"><strong>¡Cada palabra cuenta!</strong></p>`,
    `Has recibido este correo por estar inscrito como profesor/administrador en “La Hucha de Lengua”. ${automatedNotice}`,
  );
}
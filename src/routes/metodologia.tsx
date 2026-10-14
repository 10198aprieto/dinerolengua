import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage, type DocumentSection } from "@/components/document-page";
import { documentMeta } from "@/lib/document-meta";

export const Route = createFileRoute("/metodologia")({
  head: () => documentMeta("Metodología", "Objetivos, normas de funcionamiento y finalidad solidaria del juego de las multas de Lengua."),
  component: () => <DocumentPage title="Juego de las multas de Lengua" subtitle="Objetivos, normas de funcionamiento y finalidad solidaria" sections={sections} />,
});

const sections: DocumentSection[] = [
  { title: "1. Presentación e introducción", paragraphs: [
    "El juego de las multas de la asignatura de Lengua es una iniciativa educativa cuyo propósito es fomentar el buen uso del lenguaje, promover una comunicación adecuada y respetuosa, favorecer la convivencia entre compañeros y contribuir al mantenimiento de un ambiente de trabajo apropiado durante las clases.",
    "La iniciativa consiste en establecer pequeñas multas, de acuerdo con las normas previamente acordadas, cuando se producen determinadas situaciones relacionadas con el uso del lenguaje, las interrupciones innecesarias o los comportamientos que dificultan el normal desarrollo de las sesiones lectivas.",
    "Es importante señalar que estas multas no tienen como finalidad el castigo personal ni la confrontación entre compañeros. Su propósito es fundamentalmente educativo: ayudar a tomar conciencia de nuestros hábitos lingüísticos, mejorar nuestra manera de expresarnos y comprender la importancia de mantener una actitud respetuosa en el entorno escolar.",
    "Asimismo, la iniciativa incorpora una finalidad colectiva y solidaria, puesto que el dinero recaudado se destinará principalmente a la organización de un desayuno de final de curso y los recursos sobrantes se reservarán para una finalidad solidaria vinculada a la ONGD SED.",
  ] },
  { title: "2. ¿Qué comportamientos pueden dar lugar a una multa?", paragraphs: [
    "Las multas están relacionadas principalmente con tres ámbitos: el uso del lenguaje, las interrupciones durante las clases y las conductas que puedan perjudicar la convivencia o el respeto entre compañeros.",
    "En primer lugar, se pretende fomentar el buen uso del lenguaje. Por este motivo, pueden establecerse multas por la utilización de determinadas palabras malsonantes, expresiones inapropiadas o muletillas cuyo uso reiterado se pretenda reducir. Entre los ejemplos pueden encontrarse expresiones como «bro», «joder» y otras palabras o expresiones que figuren en las normas acordadas para el juego.",
    "En segundo lugar, pueden contemplarse las interrupciones innecesarias durante las explicaciones, las conversaciones continuas cuando corresponde escuchar o aquellas conductas que dificulten la concentración y el aprendizaje del resto del alumnado.",
    "En tercer lugar, pueden incluirse los comportamientos que supongan una falta de respeto hacia otros compañeros, como los insultos, los comentarios ofensivos o las expresiones que puedan resultar vejatorias.",
    "Los ejemplos anteriores tienen carácter orientativo. Las situaciones concretas que puedan dar lugar a una multa serán las establecidas en las normas del juego, que deberán ser conocidas por los participantes.",
    "Conviene aclarar que el propósito de esta iniciativa no es impedir la participación del alumnado ni limitar las preguntas, las intervenciones pertinentes o la expresión de opiniones. Se pretende distinguir entre una participación adecuada y aquellas interrupciones que dificultan el desarrollo de la clase.",
    "Del mismo modo, el contexto en el que se emplea una expresión deberá tenerse en cuenta, especialmente cuando se trate de posibles faltas de respeto. La finalidad es promover una comunicación más adecuada y una convivencia positiva, evitando que el juego se convierta en un motivo de conflicto.",
  ] },
  { title: "3. Fomento del buen lenguaje y de una comunicación adecuada", paragraphs: [
    "Uno de los objetivos fundamentales de esta iniciativa es fomentar el buen uso del lenguaje y mejorar los hábitos lingüísticos del alumnado.",
    "La forma en que nos expresamos influye en nuestra comunicación, en las relaciones que mantenemos con otras personas y en la manera en que transmitimos nuestras ideas. Por ello, resulta conveniente desarrollar una mayor conciencia sobre las palabras y expresiones que utilizamos habitualmente.",
    "El uso reiterado de determinadas muletillas, palabras malsonantes o expresiones innecesarias puede convertirse en un hábito del que no siempre somos conscientes. Mediante esta dinámica se pretende identificar esos hábitos y favorecer una forma de expresión más variada, precisa y adecuada a cada situación.",
    "Este objetivo no implica eliminar el lenguaje coloquial ni renunciar a la naturalidad al comunicarse. Se trata de comprender que cada contexto requiere una forma de expresión diferente y que disponer de un vocabulario amplio permite comunicarse con mayor claridad y eficacia.",
    "Asimismo, el buen uso del lenguaje comprende la capacidad de expresarse con educación, escuchar a los demás, respetar las opiniones ajenas y evitar aquellas expresiones que puedan resultar ofensivas.",
    "Por consiguiente, esta iniciativa no se limita a evitar determinadas palabras, sino que pretende contribuir al desarrollo de una comunicación más consciente, respetuosa y adecuada, tanto dentro como fuera del aula.",
  ] },
  { title: "4. Destino del dinero recaudado", paragraphs: [
    "El dinero obtenido mediante las multas tendrá una finalidad colectiva. Su destino principal será la organización de un desayuno de final de curso para los participantes.",
    "Esta actividad permitirá compartir un momento agradable al finalizar el año académico, reforzar la convivencia y celebrar conjuntamente el trabajo realizado durante el curso.",
    "La organización del desayuno se adaptará a la cantidad de dinero disponible, procurando realizar una gestión responsable de los recursos recaudados y ajustando los gastos al presupuesto existente.",
    "Se hace constar expresamente que la finalidad de la recaudación no es el beneficio económico personal de ningún participante, sino la financiación de una actividad común y, en última instancia, la contribución a una iniciativa solidaria mediante los recursos sobrantes.",
  ] },
  { title: "5. Destino de los recursos sobrantes: colaboración solidaria con SED ONGD", paragraphs: [
    "Una vez organizado el desayuno de final de curso, se prevé destinar el dinero que no se haya utilizado y los alimentos sobrantes que se encuentren en condiciones adecuadas a una finalidad solidaria.",
    "En concreto, se propone que dichos recursos se destinen a SED — Solidaridad, Educación y Desarrollo, una organización no gubernamental para el desarrollo que trabaja en ámbitos relacionados con la cooperación, la educación y la solidaridad.",
    "Esta parte de la iniciativa pretende que el proyecto tenga un impacto positivo más allá del propio grupo de clase. De este modo, los recursos que no sean necesarios para la actividad de final de curso podrán contribuir a apoyar una causa solidaria.",
    "La propuesta contempla, por tanto, dos finalidades complementarias: disfrutar de una actividad conjunta y aprovechar los recursos sobrantes para contribuir al trabajo de una organización comprometida con la solidaridad y la cooperación para el desarrollo.",
    "En relación con los alimentos, únicamente se contemplará su entrega cuando su conservación, manipulación y estado permitan garantizar que son aptos para su aprovechamiento. Si no resulta posible realizar una entrega segura o adecuada, se valorarán otras alternativas responsables.",
  ] },
  { title: "6. Transparencia y gestión responsable", paragraphs: [
    "Para garantizar el correcto funcionamiento de la iniciativa, resulta conveniente que las normas sean conocidas por todos los participantes y que las multas se apliquen de manera coherente, conforme a los criterios establecidos.",
    "Asimismo, se recomienda llevar un registro de las cantidades recaudadas y de los gastos efectuados para organizar el desayuno de final de curso.",
    "Al término de la actividad, podrá facilitarse un resumen de la recaudación total, los gastos realizados y los recursos sobrantes destinados a la finalidad solidaria. De esta manera, los participantes podrán conocer el destino de las aportaciones y comprobar que se han utilizado de acuerdo con los objetivos previstos.",
    "La transparencia constituye un aspecto esencial para mantener la confianza en la iniciativa y garantizar que su finalidad educativa y solidaria se desarrolle de manera adecuada.",
    "Igualmente, el juego deberá desarrollarse desde el respeto mutuo, evitando cualquier utilización de las multas que pueda dar lugar a humillaciones, enfrentamientos o situaciones incómodas entre compañeros.",
  ] },
  { title: "7. Consideraciones finales", paragraphs: [
    "El juego de las multas de Lengua constituye una iniciativa que combina objetivos educativos, lingüísticos, convivenciales y solidarios.",
    "Por una parte, pretende fomentar el buen uso del lenguaje, reducir el empleo reiterado de determinadas expresiones, evitar las interrupciones innecesarias y promover el respeto entre compañeros. Por otra, busca organizar una actividad colectiva al finalizar el curso y aprovechar los recursos sobrantes para contribuir a una finalidad solidaria vinculada a SED ONGD.",
    "La iniciativa pretende recordar que la comunicación adecuada, el respeto y la responsabilidad son aspectos fundamentales de la convivencia y del aprendizaje. También pone de manifiesto que una actividad desarrollada en el aula puede convertirse en una oportunidad para colaborar, compartir y contribuir al bienestar de otras personas.",
    "En definitiva, el objetivo de este proyecto no es únicamente recaudar dinero, sino mejorar nuestros hábitos lingüísticos, fomentar una comunicación respetuosa, favorecer la convivencia y promover la solidaridad mediante una gestión responsable de los recursos.",
  ] },
];
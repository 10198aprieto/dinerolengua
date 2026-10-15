import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage } from "@/components/document-page";
import { documentMeta } from "@/lib/document-meta";
import { CONTACT_CHANNELS, IDENTIFICATION, LEGAL_INFO } from "@/lib/legal-info";

export const Route = createFileRoute("/aviso-legal")({
  head: () => documentMeta("Aviso legal", "Información sobre el titular de La Hucha de Lengua, su finalidad educativa y las condiciones generales del sitio."),
  component: () => <DocumentPage title="Aviso legal" subtitle="Última actualización: 15 de octubre de 2026" sections={[
    { title: "1. Identificación del sitio", paragraphs: ["La Hucha de Lengua, accesible en dinerolengua.es, es una herramienta de seguimiento de las aportaciones del juego de las multas de Lengua en las clases de 3.º y 4.º ESO del Centro Cultural Vallisoletano. Esta referencia al centro no acredita su condición de titular legal ni una aprobación institucional.", IDENTIFICATION, "Diseño y creación por Mateo Fernández Prieto, titular del sitio. Esta atribución no implica por sí misma la titularidad del centro ni una relación laboral o de representación con él."] },
    { title: "2. Finalidad", paragraphs: ["El sitio permite consultar la recaudación y registrar y gestionar las aportaciones de una iniciativa educativa, de convivencia y solidaria. La metodología explica los objetivos del juego, el desayuno de final de curso y la propuesta de destinar los recursos sobrantes a SED ONGD.", "El término «multa» se utiliza en el contexto de este juego educativo y no designa una sanción administrativa. El sitio registra importes y estados de pago; no constituye una pasarela de pagos ni acredita por sí solo una obligación jurídicamente exigible."] },
    { title: "3. Propiedad intelectual", paragraphs: ["Los derechos sobre los textos, imágenes, marcas, sonido y demás contenidos corresponden a sus respectivos titulares. La atribución del diseño no transfiere esos derechos. Cualquier reproducción o difusión debe respetar la legislación aplicable y los derechos de terceros."] },
    { title: "4. Información y enlaces", paragraphs: ["Los registros pueden contener errores que deben comunicarse al titular o al profesor responsable para su revisión. Los enlaces a terceros se facilitan como referencia y sus contenidos y políticas dependen de sus respectivos titulares. La mención de SED ONGD no supone la existencia de un convenio o patrocinio."] },
    { title: "5. Marco legal y contacto", paragraphs: ["El uso del sitio queda sujeto a la normativa española y europea que resulte aplicable. Ningún texto de esta página limita derechos imperativos de los usuarios.", `Para cualquier comunicación relacionada con este sitio puede utilizarse el siguiente canal: ${CONTACT_CHANNELS}`] },
  ]} />,
});

export { LEGAL_INFO };

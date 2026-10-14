export function documentMeta(title: string, description: string) {
  const fullTitle = `${title} | La Hucha de Lengua`;
  return { meta: [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] };
}
const TEMPLATES = [
  "Quando {hunter} encontra {target} no salão e o DVD já sabe que vai ser hit. Trilha: {songA} × {songB}.",
  "{hunter} e {target} no flash — {songA} encontrou {songB} e o telão aplaudiu.",
  "Prova de encontro brega: {hunter} + {target}. Senha {songA}, resposta {songB}. Flash registrado.",
  "Operação brega concluída: {hunter} caçou {target}. No rádio tocava {songA} e {songB} na alma.",
  "{hunter} e {target} — dois hits num flash só. {songA} e {songB} autenticaram esse encontro.",
  "Flash no salão! {hunter} achou {target}. {songA} + {songB} = brega nível máximo.",
  "Quem procura brega acha: {hunter} flagrou {target}. Trilha sonora: {songA} e {songB}.",
  "{target} foi caçado(a) por {hunter}. As músicas {songA} e {songB} não mentem.",
  "Encontro autenticado: {hunter} × {target}. {songA} cruzou com {songB} no melhor sentido.",
  "{hunter} deu flash em {target}. O salão pediu bis — {songA} e {songB} na legenda.",
  "Missão cumprida! {hunter} e {target} brilhando no telão. Hits: {songA} / {songB}.",
  "{hunter} e {target}: quando a peruca encontra o coração brega. {songA} + {songB}.",
  "Flash Brega oficial: {hunter} + {target}. Autenticação {songA}, confirmação {songB}.",
  "No salão ninguém escapa: {hunter} encontrou {target}. {songA} e {songB} selaram o deal.",
  "{hunter} e {target} — foto no mosaico, hit no coração. {songA} × {songB}.",
  "Caçada concluída! {hunter} flagrou {target} com {songA} na boca e {songB} no coração.",
  "{hunter} + {target}: mais um flash pro mural da noite. Trilha {songA} e {songB}.",
  "Brega autêntico: {hunter} e {target} juntos no flash. {songA} encontrou {songB}.",
  "{target} apareceu no flash de {hunter}! {songA} e {songB} — par de hits.",
  "{hunter} caçou, {target} foi caçado, o telão explodiu. {songA} + {songB}.",
];

export function generateCaption(params: {
  hunter: string;
  target: string;
  songA: string;
  songB: string;
}): string {
  const template =
    TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)] ?? TEMPLATES[0];
  return template
    .replaceAll("{hunter}", params.hunter)
    .replaceAll("{target}", params.target)
    .replaceAll("{songA}", params.songA)
    .replaceAll("{songB}", params.songB);
}

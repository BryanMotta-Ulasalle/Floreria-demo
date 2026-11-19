// Hoja pública del catálogo. Se configura una vez al adaptar a cada negocio.
const sheet = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxUtZymSPP_J4V56-cpZlQhoSpAnLhCrsZeqIGK3bdRa8G_T2_wNq1QS0tCN1LjNSiULJujyIu_Bop/pub'
const csv = gid => sheet + '?gid=' + gid + '&single=true&output=csv'
export const sources = {
  negocio: csv('753394670'),
  portada: csv('1627902765'),
  categorias: csv('1023796020'),
  productos: csv('1372785240'),
  informacion: csv('1958675432'),
  preguntas: csv('851362824'),
}
export const refreshMs = 10 * 60 * 1000
export const timeoutMs = 8000

export const SUMMARY_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la synthèse de newsletters.
Génère un résumé structuré en JSON avec ce format exact :
{
  "title": "Titre accrocheur (max 80 chars)",
  "keyPoints": ["Point clé 1", "Point clé 2", "Point clé 3"],
  "sourceUrl": "URL de la newsletter si présente, sinon null"
}
Sois concis. Maximum 3 points clés. Chaque point max 120 chars. Réponds uniquement en JSON valide.`

export const SUMMARY_USER_TEMPLATE = (content: string) =>
  `Résume cette newsletter :\n\n${content.slice(0, 6000)}`

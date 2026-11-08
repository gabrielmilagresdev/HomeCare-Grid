import { createDemoFixture } from '../src/testing/fixtures.ts';
import { parseConciergeFilters } from '../src/domain/schemas/index.ts';
import { regions } from '../src/features/demo/format.ts';

export const XAI_MODEL = 'grok-4.3';
const XAI_ENDPOINT = 'https://api.x.ai/v1/responses';
const services = createDemoFixture().services.map(({ id, name }) => ({ id, name }));
const serviceIds = services.map(({ id }) => id);
const regionCodes = regions.map(({ code }) => code);
const tags = ['mobilidade', 'comunicacao', 'wheelchair'];

const hintPatterns = [
  [/\bfisio(?:terapia|terapeuta)?\b/u, 'fisioterapia'],
  [/\benferm(?:agem|eira|eiro)?\b/u, 'enfermagem'],
  [/\bfono(?:audiologia|audiologo|audiologa)?\b/u, 'fonoaudiologia'],
  [/\bcompanh(?:ia|eiro|eira)?\b/u, 'companhia'],
  [/\bapoio\b/u, 'apoio cotidiano'],
  [/\b(?:pos.operatorio|cirurgia)\b/u, 'pos-operatorio'],
  [/\bcentro\b/u, 'centro'],
  [/\b(?:zona )?sul\b|\bvila andrade\b/u, 'zona sul'],
  [/\b(?:zona )?oeste\b/u, 'zona oeste'],
  [/\b(?:zona )?norte\b/u, 'zona norte'],
  [/\bamanha\b/u, 'amanha'],
  [/\bmanha\b/u, 'manha'],
  [/\btarde\b/u, 'tarde'],
  [/\bmobilidade\b/u, 'mobilidade'],
  [/\bcomunicacao\b/u, 'comunicacao'],
  [/\bcadeira de rodas\b/u, 'cadeira de rodas']
];

/** Raw free text never leaves the local companion service. */
export function administrativeHints(text) {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
  return hintPatterns.filter(([pattern]) => pattern.test(normalized)).map(([, hint]) => hint);
}

const suggestionSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    serviceId: { type: 'string', enum: [...serviceIds, 'none'] },
    regionCode: { type: 'string', enum: [...regionCodes, 'none'] },
    slot: { type: 'string', enum: ['suggested', 'alternate', 'none'] },
    accessibilityTags: { type: 'array', items: { type: 'string', enum: tags } },
    clarificationNeeded: { type: 'boolean' }
  },
  required: ['serviceId', 'regionCode', 'slot', 'accessibilityTags', 'clarificationNeeded']
};

function error(code, message) { return { ok: false, error: { code, message } }; }

export function validateSuggestion(value, hints) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return error('validation', 'Resposta do assistente inválida.');
  if (Object.keys(value).sort().join(',') !== suggestionSchema.required.slice().sort().join(',')) return error('validation', 'Resposta do assistente incompleta.');
  if (![...serviceIds, 'none'].includes(value.serviceId) || ![...regionCodes, 'none'].includes(value.regionCode)
    || !['suggested', 'alternate', 'none'].includes(value.slot) || !Array.isArray(value.accessibilityTags)
    || value.accessibilityTags.some(tag => !tags.includes(tag)) || typeof value.clarificationNeeded !== 'boolean') {
    return error('validation', 'Filtros fora do catálogo.');
  }
  const requestedServices = [
    ['fisioterapia', 'demo-service-physio'], ['enfermagem', 'demo-service-nursing'],
    ['fonoaudiologia', 'demo-service-speech'], ['companhia', 'demo-service-company'], ['apoio cotidiano', 'demo-service-support']
  ].filter(([hint]) => hints.includes(hint)).map(([, id]) => id);
  const requestedRegions = [
    ['centro', 'DEMO-CENTRO'], ['zona sul', 'DEMO-ZONA-SUL'],
    ['zona oeste', 'DEMO-ZONA-OESTE'], ['zona norte', 'DEMO-ZONA-NORTE']
  ].filter(([hint]) => hints.includes(hint)).map(([, code]) => code);
  if (value.serviceId !== 'none' && !requestedServices.includes(value.serviceId)) return error('validation', 'Serviço não informado.');
  if (value.regionCode !== 'none' && !requestedRegions.includes(value.regionCode)) return error('validation', 'Região não informada.');
  if (value.slot !== 'none' && !hints.includes('amanha')) return error('validation', 'Data não informada.');
  if (value.slot === 'alternate' && !hints.includes('tarde')) return error('validation', 'Período não informado.');
  if (value.accessibilityTags.some(tag => !hints.includes(tag === 'wheelchair' ? 'cadeira de rodas' : tag))) return error('validation', 'Acessibilidade não informada.');
  const serviceId = hints.includes('pos-operatorio') && !hints.some(hint => ['fisioterapia', 'enfermagem', 'fonoaudiologia'].includes(hint))
    ? null : requestedServices.length > 1 || value.serviceId === 'none' ? null : value.serviceId;
  const regionCode = requestedRegions.length > 1 || value.regionCode === 'none' ? null : value.regionCode;
  const slot = value.slot;
  const fixture = createDemoFixture();
  const window = slot === 'none' ? null : slot === 'alternate' ? fixture.alternateWindow : fixture.suggestedWindow;
  const parsed = parseConciergeFilters({ serviceId, regionCode, window, frequency: null,
    accessibilityTags: value.accessibilityTags, clarificationNeeded: value.clarificationNeeded || !serviceId || !regionCode || !window }, serviceIds, regionCodes);
  if (!parsed.ok) return parsed;
  return { ok: true, data: { serviceId, regionCode, slot, accessibilityTags: parsed.data.accessibilityTags,
    clarificationNeeded: parsed.data.clarificationNeeded } };
}

export async function interpretWithGrok(text, { apiKey = process.env.XAI_API_KEY, fetchImpl = fetch, timeoutMs = 8000 } = {}) {
  if (typeof text !== 'string' || !text.trim() || text.length > 500) return error('validation', 'Descreva serviço, região ou horário em até 500 caracteres.');
  if (!apiKey) return error('unavailable', 'Concierge indisponível no momento.');
  const hints = administrativeHints(text);
  if (!hints.length) return { ok: true, data: { serviceId: null, regionCode: null, slot: 'none', accessibilityTags: [], clarificationNeeded: true } };
  const request = {
    model: XAI_MODEL, reasoning: { effort: 'none' }, store: false, max_output_tokens: 180,
    input: [
      { role: 'system', content: `Você organiza somente filtros administrativos para busca de cuidado em casa. Serviços permitidos: ${JSON.stringify(services)}. Regiões permitidas: ${JSON.stringify(regions)}. Slots: suggested=amanhã pela manhã; alternate=amanhã à tarde; none=sem horário explícito. Use 'none' se faltar informação. Pós-operatório isolado NÃO determina serviço. Nunca dê diagnóstico, triagem, conselho clínico, avaliação de profissional ou texto livre. Nunca invente serviço, região ou horário que não esteja nos termos fornecidos.` },
      { role: 'user', content: JSON.stringify({ administrativeTerms: hints }) }
    ],
    text: { format: { type: 'json_schema', name: 'concierge_filters', schema: suggestionSchema, strict: true } }
  };
  try {
    const response = await fetchImpl(XAI_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request), signal: AbortSignal.timeout(timeoutMs) });
    if (response.status === 429) return error('unavailable', 'Concierge temporariamente ocupado.');
    if (!response.ok) return error('unavailable', 'Concierge indisponível no momento.');
    const json = await response.json();
    const content = json?.output?.find(item => item.type === 'message')?.content?.find(item => item.type === 'output_text')?.text;
    if (json?.status !== 'completed' || typeof content !== 'string') return error('unavailable', 'Resposta do assistente incompleta.');
    const parsed = validateSuggestion(JSON.parse(content), hints);
    if (parsed.ok) console.info(JSON.stringify({ event: 'concierge_xai', model: XAI_MODEL, inputTokens: json.usage?.input_tokens ?? null, outputTokens: json.usage?.output_tokens ?? null }));
    return parsed;
  } catch (cause) {
    return error(cause?.name === 'TimeoutError' || cause?.name === 'AbortError' ? 'timeout' : 'network', 'Concierge indisponível no momento.');
  }
}

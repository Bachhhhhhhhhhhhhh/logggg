import type { Learning, MemoryNode, SearchHit } from '../types'

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'to',
  'for',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'is',
  'are',
  'was',
  'be',
  'what',
  'when',
  'how',
  'need',
  'i',
  'we',
  'me',
  'my',
  'our',
  'this',
  'that',
  'please',
  'show',
  'find',
  'get',
  'about',
  'related',
  'va',
  'cua',
  'cho',
  'khi',
  'cac',
  'mot',
  'la',
  'trong',
  'voi',
  'nhung',
  'can',
])

const SYNONYMS: Record<string, string[]> = {
  delay: ['vessel_delay', 'exceptions', 'milestones', 'eta_updates', 'schedule_change'],
  exception: ['exceptions', 'root_cause_analysis', 'external_messages', 'hold_releases'],
  exceptions: ['exceptions', 'external_messages', 'milestones'],
  invoice: ['invoices', 'charges', 'quotes', 'invoice_discrepancy'],
  invoices: ['invoices', 'charges', 'quotes'],
  charge: ['charges', 'invoices', 'rate_cards', 'accruals'],
  document: [
    'shipment_documents',
    'document_extraction',
    'packing_list',
    'commercial_invoice',
  ],
  documents: ['shipment_documents', 'document_extraction', 'bills_of_lading'],
  customs: [
    'customs_clearance',
    'declarations',
    'entries',
    'duties_and_fees',
    'isf_filing',
  ],
  container: ['containers', 'route', 'ports', 'gate_in', 'gate_out', 'chassis'],
  containers: ['containers', 'route', 'empty_return', 'container_release'],
  message: ['external_messages', 'internal_notes', 'exceptions'],
  client: ['client_66673', 'client_10482', 'company_entities', 'client_consol'],
  error: [
    'node_query_field_errors',
    'data_validation_failures',
    'schema_mismatch',
    'agent_timeout',
  ],
  booking: ['carrier_booking', 'booking_confirmation', 'booking_amendments'],
  quote: ['quotes', 'invoices', 'rate_cards'],
  port: ['ports', 'port_congestion', 'vessel_berthing', 'terminal_appointment'],
  vessel: ['vessel_tracking', 'vessel_delay', 'vessel_berthing', 'ocean_schedule'],
  fee: ['duties_and_fees', 'charges', 'demurrage', 'detention'],
  extraction: ['document_extraction', 'queue_data_extraction', 'extraction_confidence_low'],
  identity: ['user_identity_access', 'company_entities'],
  route: ['route', 'milestones', 'containers', 'ocean_schedule'],
  milestone: ['milestones', 'route', 'exceptions', 'eta_updates'],
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s_]+/g, ' ')
}

export function tokenize(q: string): string[] {
  return normalize(q)
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP.has(t))
}

function expand(tokens: string[]): Set<string> {
  const out = new Set<string>(tokens)
  for (const t of tokens) {
    const extra = SYNONYMS[t]
    if (extra) for (const id of extra) out.add(id)
    if (t.endsWith('s') && t.length > 3) out.add(t.slice(0, -1))
  }
  return out
}

export function searchMemory(
  query: string,
  nodes: MemoryNode[],
  knowledge: Learning[],
  limit = 12,
): SearchHit[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []
  const expanded = expand(tokens)
  const hits: SearchHit[] = []

  for (const node of nodes) {
    const blob = normalize(`${node.label} ${node.id} ${node.description} ${node.category}`)
    let score = 0
    for (const t of tokens) {
      if (normalize(node.label) === t) score += 12
      else if (normalize(node.label).includes(t)) score += 7
      else if (node.id.includes(t)) score += 6
      else if (blob.includes(t)) score += 2
    }
    if (expanded.has(node.id)) score += 8
    if (score > 0) {
      hits.push({
        kind: 'node',
        id: node.id,
        title: node.label,
        subtitle: node.description,
        score,
        nodeIds: [node.id],
      })
    }
  }

  for (const item of knowledge) {
    const blob = normalize(item.text)
    let score = 0
    for (const t of tokens) {
      if (blob.includes(t)) score += 3
    }
    for (const id of item.nodeIds) {
      if (expanded.has(id)) score += 4
    }
    if (score > 0) {
      hits.push({
        kind: 'learning',
        id: item.id,
        title: item.text,
        subtitle: item.source,
        score,
        nodeIds: item.nodeIds,
      })
    }
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  return hits.slice(0, limit)
}

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260814)

function pick(n, min, max) {
  return min + n * (max - min)
}

function irand(min, max) {
  return Math.floor(pick(rand(), min, max + 1))
}

function slug(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

const RAW_NODES = [
  // operations
  ['Ports', 'operations', 'Physical port calls, terminal capacity, and berth windows used to plan ocean moves.'],
  ['Vessel Tracking', 'operations', 'Live AIS/schedule position of vessels against booked sailings and ETAs.'],
  ['Carrier Booking', 'operations', 'Allocation requests, confirmations, and amendments with ocean and air carriers.'],
  ['Containers', 'operations', 'Container inventory, equipment type, and lifecycle from pickup to empty return.'],
  ['Route', 'operations', 'Lane design, transshipment hops, and preferred routings for a shipment.'],
  ['Bills Of Lading', 'operations', 'Master and house B/L issuance, surrender, and telex-release workflow.'],
  ['Customs Clearance', 'operations', 'Filing, exam holds, and release of cargo with customs authorities.'],
  ['Declarations', 'operations', 'Import/export declaration drafts, amendments, and authority acknowledgements.'],
  ['Entries', 'operations', 'Formal customs entries, line items, and liquidation status.'],
  ['Client Consol', 'operations', 'Outbound consolidation built for a single client across vendors or POs.'],
  ['Buyers Consol', 'operations', 'Buyer-arranged consolidation combining multiple suppliers into one move.'],
  ['Exceptions', 'operations', 'Operational breaks: delays, missing docs, holds, rolls, and customer escalations.'],
  ['Root Cause Analysis', 'operations', 'Structured RCA on recurring exceptions to extract reusable playbooks.'],
  ['Air Planning Tools', 'operations', 'Air capacity, cutoff, and routing planners used by the air desk.'],
  ['External Messages', 'operations', 'Customer-facing updates, carrier emails, and portal notifications.'],
  ['Internal Notes', 'operations', 'Operator annotations, handoffs, and private case context.'],
  ['Milestones', 'operations', 'Shipment event spine: gated, sailed, arrived, delivered, and exceptions in between.'],
  ['Company Entities', 'operations', 'Shipper, consignee, notify, and billing-party master data.'],
  ['Client 66673', 'operations', 'High-volume account whose playbooks dominate exception and consol patterns.'],
  ['Client 10482', 'operations', 'Account with strict milestone SLAs and frequent quote-to-invoice reconciliation.'],
  ['Demurrage', 'operations', 'Container dwell beyond free time at terminal, often tied to holds or docs.'],
  ['Detention', 'operations', 'Off-terminal equipment overtime after gate-out, driven by return cycles.'],
  ['Transshipment', 'operations', 'Relay port connections, missed feeders, and restow events.'],
  ['Port Congestion', 'operations', 'Yard density, berth queues, and rolling impacts on ETA reliability.'],
  ['Vessel Delay', 'operations', 'Late arrivals, omitted ports, and blank sailings that break downstream plans.'],
  ['Booking Confirmation', 'operations', 'Carrier-confirmed space, equipment, and sailing assignment.'],
  ['Cutoff Times', 'operations', 'SI, VGM, and terminal cutoffs that gate whether cargo makes a sailing.'],
  ['Empty Return', 'operations', 'Empty container return locations, appointments, and per-diem clocks.'],
  ['Container Release', 'operations', 'Pin, hold, and release of equipment to trucker or rail.'],
  ['Warehouse Intake', 'operations', 'CFS/warehouse receiving, carton counts, and exception photos.'],
  ['Last Mile', 'operations', 'Final delivery appointments, POD capture, and accessorials.'],
  ['Freight Forwarding', 'operations', 'End-to-end coordination across origin, main leg, and destination.'],
  ['Incoterms', 'operations', 'Responsibility split that drives who books, who files, and who pays.'],
  ['Origin Handling', 'operations', 'Pickup, export CFS, and origin port handling before the main leg.'],
  ['Destination Handling', 'operations', 'Arrival CFS, deconsolidation, and inland handoff after discharge.'],
  ['ISF Filing', 'operations', 'Importer Security Filing 10+2 lead-time and amendment tracking.'],
  ['Arrival Notice', 'operations', 'Carrier/forwarder arrival notice that unlocks destination workflow.'],
  ['Proof Of Delivery', 'operations', 'Signed POD artifacts used to close milestones and invoices.'],
  ['Schedule Change', 'operations', 'Carrier schedule revisions that require replan and customer notice.'],
  ['Carrier Allocation', 'operations', 'Weekly space allotments and how they are consumed across clients.'],
  ['Drayage', 'operations', 'Port/rail trucking, chassis pairing, and dual transactions.'],
  ['Chassis', 'operations', 'Chassis pool usage, splits, and per-diem that attach to drayage.'],
  ['Rail Intermodal', 'operations', 'On-dock / near-dock rail ramps and dwell between vessel and inland.'],
  ['Ocean Schedule', 'operations', 'Proforma vs actual proforma sailings used for booking and ETA.'],
  ['Air Freight', 'operations', 'Air waybill, flight assignment, and recovery when ocean slips.'],
  ['Booking Amendments', 'operations', 'Commodity, weight, or party changes after the original booking.'],
  ['Hold Releases', 'operations', 'Customs, freight, or carrier holds and the sequence to lift them.'],
  ['Terminal Appointment', 'operations', 'Truck appointment slots for gate-in/out against terminal systems.'],
  ['Gate Out', 'operations', 'Full-out event starting detention and inland transit.'],
  ['Gate In', 'operations', 'Empty or full return through the terminal gate.'],
  ['Vessel Berthing', 'operations', 'Actual berth time vs window, used to explain ETA slips.'],
  ['ETA Updates', 'operations', 'Propagated arrival estimates consumed by milestones and messages.'],

  // documents
  ['Commercial Invoice', 'documents', 'Value and Incoterm evidence used for customs and billing.'],
  ['Shipment Documents', 'documents', 'The working packet: B/L, invoice, packing list, certificates, and ISF.'],
  ['Document Extraction', 'documents', 'OCR/LLM extraction of fields from unstructured trade documents.'],
  ['Packing List', 'documents', 'Carton/weight/dimension detail that must reconcile with the invoice.'],
  ['Duties And Fees', 'documents', 'Duty, MPF, HMF, and brokerage fee lines computed from entries.'],
  ['Certificate Of Origin', 'documents', 'Preferential origin evidence that changes duty treatment.'],
  ['Phytosanitary Cert', 'documents', 'Plant-health certificate required for agri and wood-pack cargo.'],
  ['Insurance Certificate', 'documents', 'Cargo insurance evidence referenced in claims and letters of credit.'],
  ['Delivery Order', 'documents', 'Release instruction that lets the trucker pick up at destination.'],
  ['Export License', 'documents', 'Controlled-goods authorization checked before carrier booking.'],
  ['Import Permit', 'documents', 'Destination-side permit that can hold clearance if stale.'],
  ['AMS Filing', 'documents', 'Automated Manifest System filings and amendment penalties.'],
  ['Manifest', 'documents', 'Vessel/flight manifest lines that must match B/L and ISF.'],
  ['Letter Of Credit', 'documents', 'Bank document set and discrepancy handling against the LC terms.'],
  ['Arrival Notice Doc', 'documents', 'The arrival-notice PDF itself, distinct from the milestone event.'],
  ['Telex Release', 'documents', 'Surrender of original B/L via telex so cargo can be released.'],

  // issues
  ['Node Query Field Errors', 'issues', 'Graph/query field mismatches when agents read operational nodes.'],
  ['Queue Data Extraction', 'issues', 'Failures pulling structured fields from intake queues and inboxes.'],
  ['User Identity Access', 'issues', 'AuthZ mismatches when an agent acts as the wrong company entity.'],
  ['Data Validation Failures', 'issues', 'Schema and business-rule rejects on extracted shipment fields.'],
  ['Schema Mismatch', 'issues', 'Upstream payload shape drift that breaks downstream node writes.'],
  ['Duplicate Booking', 'issues', 'Two live bookings for the same PO/container causing split milestones.'],
  ['Missing Documents', 'issues', 'Required trade docs not present before cutoff or clearance.'],
  ['Incorrect HS Code', 'issues', 'Misclassified tariff lines that cascade into duty and exam risk.'],
  ['Invoice Discrepancy', 'issues', 'Quote vs invoice vs rate-card mismatches flagged in audit.'],
  ['Status Sync Failures', 'issues', 'Carrier/terminal status not landing on the milestone spine.'],
  ['Agent Timeout', 'issues', 'Agent tool calls that expire mid-extraction or mid-message.'],
  ['Extraction Confidence Low', 'issues', 'Model confidence below threshold on critical document fields.'],

  // finance
  ['Charges', 'finance', 'Accessorial and freight charge codes applied to a shipment.'],
  ['Invoices', 'finance', 'Customer and vendor invoices, credit notes, and payment state.'],
  ['Quotes', 'finance', 'Sell-side quotes and validity windows before booking.'],
  ['Account Profitability', 'finance', 'Contribution margin by client, lane, and product after accruals.'],
  ['Credit Hold', 'finance', 'Credit-limit holds that block booking or release.'],
  ['Payment Terms', 'finance', 'Net terms and prepaid/collect splits that change invoice timing.'],
  ['Accruals', 'finance', 'Unbilled cost estimates accrued until vendor invoices arrive.'],
  ['Rate Cards', 'finance', 'Contracted buy/sell rates used to build quotes and audit charges.'],
]

const COMMUNITIES = [
  {
    id: 'exception_comms',
    name: 'Exception Handling & Communication',
    description: 'How delays and holds become customer-visible updates, internal notes, and recovered milestones.',
    labels: [
      'Exceptions',
      'External Messages',
      'Internal Notes',
      'Milestones',
      'Root Cause Analysis',
      'Vessel Delay',
      'Schedule Change',
      'Hold Releases',
      'ETA Updates',
      'Client 66673',
      'Status Sync Failures',
    ],
  },
  {
    id: 'financial',
    name: 'Financial Reconciliation',
    description: 'Quote-to-cash integrity: rate cards, charges, invoices, and account-level profitability.',
    labels: [
      'Charges',
      'Invoices',
      'Quotes',
      'Account Profitability',
      'Credit Hold',
      'Payment Terms',
      'Accruals',
      'Rate Cards',
      'Invoice Discrepancy',
    ],
  },
  {
    id: 'docs_customs',
    name: 'Document & Customs Processing',
    description: 'Packet assembly, extraction, filings, and the duty lines that depend on them.',
    labels: [
      'Shipment Documents',
      'Document Extraction',
      'Commercial Invoice',
      'Packing List',
      'Customs Clearance',
      'Declarations',
      'Entries',
      'Duties And Fees',
      'Bills Of Lading',
      'Certificate Of Origin',
      'ISF Filing',
      'AMS Filing',
      'Manifest',
      'Incorrect HS Code',
      'Missing Documents',
      'Extraction Confidence Low',
      'Phytosanitary Cert',
      'Letter Of Credit',
      'Export License',
      'Import Permit',
      'Telex Release',
    ],
  },
  {
    id: 'vessel_container',
    name: 'Vessel & Container Operations',
    description: 'Physical network: ports, vessels, boxes, gates, and the inland equipment that follows.',
    labels: [
      'Ports',
      'Vessel Tracking',
      'Containers',
      'Route',
      'Ocean Schedule',
      'Transshipment',
      'Port Congestion',
      'Vessel Berthing',
      'Gate In',
      'Gate Out',
      'Terminal Appointment',
      'Chassis',
      'Drayage',
      'Empty Return',
      'Container Release',
      'Rail Intermodal',
      'Demurrage',
      'Detention',
    ],
  },
  {
    id: 'booking_planning',
    name: 'Planning & Booking',
    description: 'Space, cutoffs, and amendments that lock a shipment onto a sailing or flight.',
    labels: [
      'Carrier Booking',
      'Booking Confirmation',
      'Cutoff Times',
      'Carrier Allocation',
      'Air Planning Tools',
      'Air Freight',
      'Booking Amendments',
      'Duplicate Booking',
      'Freight Forwarding',
      'Incoterms',
      'Origin Handling',
    ],
  },
  {
    id: 'client_consol',
    name: 'Client & Consol Workflows',
    description: 'Account-specific consols, warehouse intake, and last-mile closeout.',
    labels: [
      'Client Consol',
      'Buyers Consol',
      'Company Entities',
      'Client 10482',
      'Warehouse Intake',
      'Last Mile',
      'Proof Of Delivery',
      'Destination Handling',
      'Arrival Notice',
      'Delivery Order',
      'Arrival Notice Doc',
      'Insurance Certificate',
    ],
  },
  {
    id: 'data_quality',
    name: 'Access & Data Quality',
    description: 'Agent tooling failures: identity, schema drift, queue extraction, and field errors.',
    labels: [
      'Node Query Field Errors',
      'Queue Data Extraction',
      'User Identity Access',
      'Data Validation Failures',
      'Schema Mismatch',
      'Agent Timeout',
    ],
  },
]

const HERO = [
  ['Exceptions', 'External Messages', 178],
  ['Charges', 'Invoices', 164],
  ['Exceptions', 'Milestones', 151],
  ['Milestones', 'Route', 142],
  ['Shipment Documents', 'Document Extraction', 136],
  ['Charges', 'Exceptions', 128],
  ['Exceptions', 'Invoices', 121],
  ['Quotes', 'Invoices', 114],
  ['Quotes', 'Milestones', 108],
  ['External Messages', 'Internal Notes', 103],
  ['Quotes', 'Exceptions', 97],
  ['Containers', 'Route', 91],
]

const AFFINITY = [
  ['Exceptions', 'Vessel Delay', 74],
  ['Exceptions', 'Root Cause Analysis', 71],
  ['Milestones', 'ETA Updates', 69],
  ['Invoices', 'Rate Cards', 66],
  ['Charges', 'Rate Cards', 64],
  ['Document Extraction', 'Extraction Confidence Low', 62],
  ['Customs Clearance', 'Declarations', 61],
  ['Declarations', 'Entries', 59],
  ['Containers', 'Gate Out', 58],
  ['Containers', 'Gate In', 56],
  ['Ports', 'Vessel Berthing', 55],
  ['Vessel Tracking', 'Ocean Schedule', 54],
  ['Drayage', 'Chassis', 53],
  ['Carrier Booking', 'Booking Confirmation', 52],
  ['Missing Documents', 'Shipment Documents', 51],
  ['Client Consol', 'Warehouse Intake', 49],
  ['Buyers Consol', 'Client Consol', 48],
  ['Duties And Fees', 'Entries', 47],
  ['ISF Filing', 'AMS Filing', 46],
  ['Bills Of Lading', 'Telex Release', 45],
  ['Hold Releases', 'Customs Clearance', 44],
  ['Demurrage', 'Port Congestion', 43],
  ['Detention', 'Empty Return', 42],
  ['Invoice Discrepancy', 'Invoices', 41],
  ['User Identity Access', 'Company Entities', 40],
  ['Node Query Field Errors', 'Queue Data Extraction', 39],
  ['Air Freight', 'Air Planning Tools', 38],
  ['Last Mile', 'Proof Of Delivery', 37],
  ['Account Profitability', 'Invoices', 36],
  ['Credit Hold', 'Payment Terms', 34],
]

const KNOWLEDGE = [
  {
    text: 'Khi phát sinh Exception liên quan đến vessel delay, ưu tiên gửi External Message cho khách hàng trong vòng 2 giờ để tránh escalation.',
    nodes: ['Exceptions', 'Vessel Delay', 'External Messages', 'Milestones'],
    source: 'Học từ 47 trường hợp vận hành thực tế',
    category: 'operations',
    daysAgo: 2,
  },
  {
    text: 'Charges trên Invoice thường lệch khi Quote được tạo trước lúc Rate Card cập nhật — luôn đối chiếu Rate Cards trước khi phát hành.',
    nodes: ['Charges', 'Invoices', 'Quotes', 'Rate Cards'],
    source: 'Học từ 112 lần đối soát quote-to-invoice',
    category: 'finance',
    daysAgo: 3,
  },
  {
    text: 'Document Extraction thất bại chủ yếu do Packing List scan nghiêng; yêu cầu ảnh ≥ 200 DPI trước khi retry pipeline.',
    nodes: ['Document Extraction', 'Packing List', 'Extraction Confidence Low'],
    source: 'Học từ 86 job extraction',
    category: 'documents',
    daysAgo: 1,
  },
  {
    text: 'Cặp Exceptions ↔ External Messages là tín hiệu đồng xuất hiện mạnh nhất: mọi exception “mở” quá 90 phút mà chưa có message gần như chắc chắn bị escalate.',
    nodes: ['Exceptions', 'External Messages'],
    source: 'Học từ 165 cặp đồng xuất hiện',
    category: 'operations',
    daysAgo: 4,
  },
  {
    text: 'Khi Milestone Route bị gãy vì transshipment miss, cập nhật ETA trước, rồi mới đụng Booking Amendment — đảo thứ tự tạo duplicate booking.',
    nodes: ['Milestones', 'Route', 'Transshipment', 'Booking Amendments', 'Duplicate Booking'],
    source: 'Học từ 31 shipment bị roll',
    category: 'operations',
    daysAgo: 5,
  },
  {
    text: 'Shipment Documents thiếu Certificate Of Origin làm Duties And Fees tính sai trên Entries — chặn clearance cho đến khi origin evidence đủ.',
    nodes: ['Shipment Documents', 'Certificate Of Origin', 'Duties And Fees', 'Entries'],
    source: 'Học từ 22 tờ khai ưu đãi',
    category: 'documents',
    daysAgo: 6,
  },
  {
    text: 'Client 66673 coi milestone “hold released” là SLA cứng 4 giờ; Internal Notes không thay thế External Messages với account này.',
    nodes: ['Client 66673', 'Hold Releases', 'Milestones', 'External Messages', 'Internal Notes'],
    source: 'Học từ playbook account 66673',
    category: 'operations',
    daysAgo: 3,
  },
  {
    text: 'Node Query Field Errors tăng đột biến khi agent đọc field `consol_type` trên Buyers Consol — schema đã đổi thành `consol_mode`.',
    nodes: ['Node Query Field Errors', 'Buyers Consol', 'Schema Mismatch'],
    source: 'Học từ 19 agent traceback',
    category: 'issues',
    daysAgo: 1,
  },
  {
    text: 'Queue Data Extraction hay mất số container khi email carrier dùng font proportional; normalize về plaintext trước khi parse.',
    nodes: ['Queue Data Extraction', 'Containers', 'External Messages'],
    source: 'Học từ 54 email carrier',
    category: 'issues',
    daysAgo: 7,
  },
  {
    text: 'User Identity Access fail khi agent impersonate sai Company Entity trên Client Consol — luôn resolve entity từ booking party, không từ thread gần nhất.',
    nodes: ['User Identity Access', 'Company Entities', 'Client Consol'],
    source: 'Học từ 14 sự cố phân quyền',
    category: 'issues',
    daysAgo: 8,
  },
  {
    text: 'Demurrage gần như luôn đi cùng Port Congestion + thiếu Terminal Appointment; book slot ngay khi ETA lệch > 12 giờ.',
    nodes: ['Demurrage', 'Port Congestion', 'Terminal Appointment', 'ETA Updates'],
    source: 'Học từ 40 container dwell',
    category: 'operations',
    daysAgo: 4,
  },
  {
    text: 'Detention giảm rõ khi Empty Return location được chốt trong Internal Notes ngay lúc Gate Out, không để trucker tự chọn depot.',
    nodes: ['Detention', 'Empty Return', 'Gate Out', 'Internal Notes'],
    source: 'Học từ 28 vòng đời thiết bị',
    category: 'operations',
    daysAgo: 9,
  },
  {
    text: 'ISF Filing phải đi trước AMS Filing ít nhất 24 giờ trên lane Mỹ; đảo thứ tự tạo penalty và giữ Entries.',
    nodes: ['ISF Filing', 'AMS Filing', 'Entries'],
    source: 'Học từ 17 lô US inbound',
    category: 'documents',
    daysAgo: 10,
  },
  {
    text: 'Invoice Discrepancy hay đến từ Charges “destination handling” bị nhân đôi khi Arrival Notice Doc được ingest hai lần.',
    nodes: ['Invoice Discrepancy', 'Charges', 'Destination Handling', 'Arrival Notice Doc'],
    source: 'Học từ 33 credit note',
    category: 'finance',
    daysAgo: 2,
  },
  {
    text: 'Quotes hết hạn vẫn bị agent tái sử dụng nếu Milestones chưa có booking confirmation — khóa quote sau cutoff của sailing.',
    nodes: ['Quotes', 'Milestones', 'Booking Confirmation', 'Cutoff Times'],
    source: 'Học từ 26 quote stale',
    category: 'finance',
    daysAgo: 6,
  },
  {
    text: 'Account Profitability âm trên Client 10482 chủ yếu vì Accruals thấp hơn vendor invoice thực tế ở Drayage + Chassis.',
    nodes: ['Account Profitability', 'Client 10482', 'Accruals', 'Drayage', 'Chassis'],
    source: 'Học từ 3 kỳ đóng sổ',
    category: 'finance',
    daysAgo: 12,
  },
  {
    text: 'Air Planning Tools nên được kích hoạt tự động khi Vessel Delay > 5 ngày và hàng có Letter Of Credit sắp hết hạn.',
    nodes: ['Air Planning Tools', 'Vessel Delay', 'Air Freight', 'Letter Of Credit'],
    source: 'Học từ 11 recovery air',
    category: 'operations',
    daysAgo: 11,
  },
  {
    text: 'Packing List và Commercial Invoice lệch carton count là predictor mạnh của Data Validation Failures ở bước Entries.',
    nodes: ['Packing List', 'Commercial Invoice', 'Data Validation Failures', 'Entries'],
    source: 'Học từ 48 bộ chứng từ',
    category: 'documents',
    daysAgo: 5,
  },
  {
    text: 'Telex Release chỉ an toàn sau khi Bills Of Lading đã surrender và Credit Hold đã nhả — bỏ bước credit gây claim.',
    nodes: ['Telex Release', 'Bills Of Lading', 'Credit Hold'],
    source: 'Học từ 9 case nhả hàng sớm',
    category: 'documents',
    daysAgo: 13,
  },
  {
    text: 'Status Sync Failures từ terminal thường im lặng: nếu Gate Out không về sau Terminal Appointment 6 giờ, poll lại và mở Exception.',
    nodes: ['Status Sync Failures', 'Gate Out', 'Terminal Appointment', 'Exceptions'],
    source: 'Học từ 35 lần mất event',
    category: 'issues',
    daysAgo: 3,
  },
  {
    text: 'Incorrect HS Code trên hàng Client Consol lan sang toàn bộ Buyers Consol nếu agent copy classification từ SKU “tương tự”.',
    nodes: ['Incorrect HS Code', 'Client Consol', 'Buyers Consol'],
    source: 'Học từ 7 exam hàng loạt',
    category: 'issues',
    daysAgo: 14,
  },
  {
    text: 'Carrier Allocation cạn vào thứ Năm; Booking Amendments đổi hàng sau cutoff gần như chắc bị roll — escalate sớm cho Carrier Booking.',
    nodes: ['Carrier Allocation', 'Booking Amendments', 'Cutoff Times', 'Carrier Booking'],
    source: 'Học từ 21 tuần allotment',
    category: 'operations',
    daysAgo: 7,
  },
  {
    text: 'Proof Of Delivery thiếu chữ ký làm Invoices bị dispute; Last Mile agent phải từ chối close milestone nếu POD image confidence thấp.',
    nodes: ['Proof Of Delivery', 'Invoices', 'Last Mile', 'Milestones'],
    source: 'Học từ 18 dispute',
    category: 'operations',
    daysAgo: 8,
  },
  {
    text: 'Agent Timeout khi extract Manifest lớn: cắt theo B/L group 20 dòng, ghi partial node, rồi resume — đừng retry cả file.',
    nodes: ['Agent Timeout', 'Manifest', 'Document Extraction', 'Bills Of Lading'],
    source: 'Học từ 12 timeout job',
    category: 'issues',
    daysAgo: 2,
  },
  {
    text: 'Incoterms DDP đổi người chịu Duties And Fees — nếu Company Entities chưa map importer of record, dừng tự động clearance.',
    nodes: ['Incoterms', 'Duties And Fees', 'Company Entities', 'Customs Clearance'],
    source: 'Học từ 16 lô DDP',
    category: 'operations',
    daysAgo: 9,
  },
  {
    text: 'Rail Intermodal dwell > 48 giờ thường đi với thiếu Chassis ở ramp; mở Exception loại equipment, không phải vessel.',
    nodes: ['Rail Intermodal', 'Chassis', 'Exceptions'],
    source: 'Học từ 24 lô inland',
    category: 'operations',
    daysAgo: 15,
  },
  {
    text: 'Arrival Notice milestone và Arrival Notice Doc phải được nối bằng cùng shipment key; tách chúng làm Destination Handling bị kích hoạt hai lần.',
    nodes: ['Arrival Notice', 'Arrival Notice Doc', 'Destination Handling'],
    source: 'Học từ 20 lần double-trigger',
    category: 'documents',
    daysAgo: 4,
  },
  {
    text: 'Payment Terms prepaid đòi hỏi Quotes lock trước Carrier Booking; collect cho phép book trước nhưng Credit Hold phải remaining > 0.',
    nodes: ['Payment Terms', 'Quotes', 'Carrier Booking', 'Credit Hold'],
    source: 'Học từ policy tài chính Q2',
    category: 'finance',
    daysAgo: 16,
  },
  {
    text: 'Phytosanitary Cert hết hạn trong transshipment làm Customs Clearance đứng — check residual validity trước khi confirm feeder.',
    nodes: ['Phytosanitary Cert', 'Transshipment', 'Customs Clearance'],
    source: 'Học từ 8 lô agri',
    category: 'documents',
    daysAgo: 18,
  },
  {
    text: 'Internal Notes chứa số PIN Container Release không được echo sang External Messages — redaction rule đã miss 3 lần trong tháng.',
    nodes: ['Internal Notes', 'External Messages', 'Container Release'],
    source: 'Học từ review bảo mật',
    category: 'operations',
    daysAgo: 1,
  },
  {
    text: 'Ocean Schedule đổi proforma không tự cập nhật Route nếu transshipment port bị omit — agent phải recompute path, không chỉ ETA.',
    nodes: ['Ocean Schedule', 'Route', 'Transshipment', 'ETA Updates'],
    source: 'Học từ 13 blank sailing',
    category: 'operations',
    daysAgo: 6,
  },
  {
    text: 'Warehouse Intake thiếu photo exception thì Root Cause Analysis sau này không đủ bằng chứng để claim carrier.',
    nodes: ['Warehouse Intake', 'Root Cause Analysis', 'Exceptions'],
    source: 'Học từ 15 claim bị từ chối',
    category: 'operations',
    daysAgo: 11,
  },
  {
    text: 'Export License kiểm tra trước Carrier Booking với SKU controlled; phát hiện muộn đẩy Duplicate Booking khi phải tách lô.',
    nodes: ['Export License', 'Carrier Booking', 'Duplicate Booking'],
    source: 'Học từ 6 lô dual-use',
    category: 'documents',
    daysAgo: 20,
  },
  {
    text: 'Delivery Order không phát hành khi Hold Releases còn freight hold — kể cả khi Customs Clearance đã green.',
    nodes: ['Delivery Order', 'Hold Releases', 'Customs Clearance'],
    source: 'Học từ 12 lần nhả DO sớm',
    category: 'operations',
    daysAgo: 7,
  },
  {
    text: 'Schema Mismatch trên field `charge_code` làm Accruals ghi sai map sang Rate Cards — thêm alias layer trước khi write node.',
    nodes: ['Schema Mismatch', 'Accruals', 'Rate Cards', 'Charges'],
    source: 'Học từ 10 nightly job',
    category: 'issues',
    daysAgo: 3,
  },
  {
    text: 'Client Consol origin mixed HS buộc tách Entries; gộp một tờ khai là nguyên nhân Incorrect HS Code lan.',
    nodes: ['Client Consol', 'Entries', 'Incorrect HS Code'],
    source: 'Học từ 9 consol mixed',
    category: 'operations',
    daysAgo: 17,
  },
  {
    text: 'Vessel Tracking “jumped” > 200 hải lý / 6 giờ thường là AIS spoof hoặc wrong vessel IMO — đừng tin ETA Updates cho đến khi đối chiếu Ocean Schedule.',
    nodes: ['Vessel Tracking', 'ETA Updates', 'Ocean Schedule'],
    source: 'Học từ 5 tín hiệu AIS lệch',
    category: 'operations',
    daysAgo: 8,
  },
  {
    text: 'Insurance Certificate phải cover transshipment port mới nếu Route đổi; thiếu giấy này chặn Letter Of Credit presentation.',
    nodes: ['Insurance Certificate', 'Transshipment', 'Route', 'Letter Of Credit'],
    source: 'Học từ 4 presentation LC',
    category: 'documents',
    daysAgo: 19,
  },
  {
    text: 'Import Permit gắn theo consignee, không theo Client Consol; copy permit từ lô trước của cùng client là anti-pattern.',
    nodes: ['Import Permit', 'Company Entities', 'Client Consol'],
    source: 'Học từ 7 permit reuse',
    category: 'documents',
    daysAgo: 21,
  },
  {
    text: 'Khi Charges ↔ Exceptions đồng xuất hiện, kiểm tra Demurrage/Detention trước các surcharge khác — đây là hai mã hay bị miss trên Quote.',
    nodes: ['Charges', 'Exceptions', 'Demurrage', 'Detention', 'Quotes'],
    source: 'Học từ 58 exception có fee',
    category: 'finance',
    daysAgo: 2,
  },
  {
    text: 'Air Freight recovery chỉ close được khi Proof Of Delivery air và ocean residual đều gắn cùng milestone family, nếu không Invoices split.',
    nodes: ['Air Freight', 'Proof Of Delivery', 'Milestones', 'Invoices'],
    source: 'Học từ 8 lô hybrid',
    category: 'operations',
    daysAgo: 14,
  },
  {
    text: 'Data Validation Failures trên weight: tin Packing List hơn Commercial Invoice, trừ khi Invoice có stamp “VGM verified”.',
    nodes: ['Data Validation Failures', 'Packing List', 'Commercial Invoice'],
    source: 'Học từ 27 lệch weight',
    category: 'issues',
    daysAgo: 5,
  },
]

const DEVWORK = [
  {
    title: 'Đã thêm 12 subtheme mới từ batch xử lý tuần 32',
    detail: 'Bổ sung node về chassis, rail intermodal, telex release và các field error của agent sau khi ingest 18k log.',
    kind: 'add',
    daysAgo: 1,
    hour: 9,
  },
  {
    title: "Đã hợp nhất 2 node trùng lặp: 'Container Track' và 'Containers'",
    detail: 'Alias `container_track` trỏ về `containers`. 214 cạnh được viết lại, không mất weight lịch sử.',
    kind: 'merge',
    daysAgo: 2,
    hour: 16,
  },
  {
    title: 'Đã phát hiện 3 cụm chủ đề mới',
    detail: 'Leiden (resolution 1.1) tách Access & Data Quality khỏi Document Processing, đồng thời nổi cụm Planning & Booking.',
    kind: 'detect',
    daysAgo: 3,
    hour: 7,
  },
  {
    title: 'Reindex embedding cho 1.412 cạnh đồng xuất hiện',
    detail: 'Đổi sang cosine trên text-embedding-3-large; search “vessel delay customer notice” tăng recall @10 từ 0.61 lên 0.78.',
    kind: 'reindex',
    daysAgo: 4,
    hour: 22,
  },
  {
    title: 'Sửa hướng cạnh Charges → Invoices bị đảo trong snapshot 2026-08-06',
    detail: 'ETL ghi nhầm source/target trên 36 cạnh tài chính. Strongest-links đã được tính lại.',
    kind: 'fix',
    daysAgo: 5,
    hour: 11,
  },
  {
    title: 'Đã thêm 8 bài học từ RCA tuần 31',
    detail: 'Distill agent tóm tắt 8 playbook mới, gắn vào Exceptions, Quotes và Document Extraction.',
    kind: 'add',
    daysAgo: 6,
    hour: 18,
  },
  {
    title: "Hợp nhất 'Arrival Notice' (event) và loại bỏ nhầm với PDF",
    detail: 'Tách thành `arrival_notice` (milestone) và `arrival_notice_doc` (artifact) sau 20 lần double-trigger Destination Handling.',
    kind: 'merge',
    daysAgo: 8,
    hour: 10,
  },
  {
    title: 'Chạy lại community detection với resolution 0.9',
    detail: 'Cụm Client & Consol Workflows ổn định hơn; modularity 0.41 → 0.46.',
    kind: 'detect',
    daysAgo: 10,
    hour: 6,
  },
  {
    title: 'Backfill trend 16 tuần cho toàn bộ node',
    detail: 'Rollup tần suất xuất hiện theo tuần từ agent log 2026-04 → 2026-08 để vẽ sparkline trong drawer.',
    kind: 'reindex',
    daysAgo: 12,
    hour: 3,
  },
  {
    title: 'Loại 4 node orphan sau khi lọc stop-entity',
    detail: '`test_client`, `sandbox_port`, `dummy_invoice`, `agent_debug` bị loại khỏi graph production.',
    kind: 'fix',
    daysAgo: 15,
    hour: 14,
  },
  {
    title: 'Thêm subtheme Account Profitability và Accruals',
    detail: 'Finance desk yêu cầu nhìn contribution margin cạnh quote/invoice, không chỉ charge codes.',
    kind: 'add',
    daysAgo: 18,
    hour: 15,
  },
  {
    title: 'Snapshot schema v3: thêm communityId và trend[]',
    detail: 'Frontend đọc được cụm + sparkline mà không cần gọi thêm endpoint. Tương thích ngược v2.',
    kind: 'fix',
    daysAgo: 21,
    hour: 9,
  },
]

const JOBS = [
  {
    id: 'entity-extract-agent-logs',
    name: 'Entity extract — agent logs',
    status: 'completed',
    cron: '*/15 * * * *',
    hoursAgo: 0.4,
    records: 18420,
    durationMs: 73400,
  },
  {
    id: 'relation-cooccurrence',
    name: 'Relation builder — co-occurrence',
    status: 'running',
    cron: '5 * * * *',
    hoursAgo: 0.1,
    records: 6122,
    durationMs: 0,
  },
  {
    id: 'learning-distill',
    name: 'Learning distill — playbooks',
    status: 'completed',
    cron: '0 2 * * *',
    hoursAgo: 8,
    records: 47,
    durationMs: 412000,
  },
  {
    id: 'community-leiden',
    name: 'Community detection — Leiden',
    status: 'completed',
    cron: '30 3 * * *',
    hoursAgo: 7,
    records: 88,
    durationMs: 18800,
  },
  {
    id: 'embedding-reindex',
    name: 'Embedding reindex — nodes & notes',
    status: 'completed',
    cron: '0 4 * * 0',
    hoursAgo: 30,
    records: 2210,
    durationMs: 890000,
  },
  {
    id: 'node-dedup',
    name: 'Node dedup — alias merge',
    status: 'failed',
    cron: '0 1 * * *',
    hoursAgo: 9,
    records: 0,
    durationMs: 2400,
  },
  {
    id: 'trend-rollup',
    name: 'Trend rollup — weekly counts',
    status: 'completed',
    cron: '15 5 * * *',
    hoursAgo: 6,
    records: 1408,
    durationMs: 9600,
  },
  {
    id: 'snapshot-export',
    name: 'Snapshot export — memory graph',
    status: 'completed',
    cron: '0 6 * * *',
    hoursAgo: 5,
    records: 1,
    durationMs: 1800,
  },
  {
    id: 'graph-health-check',
    name: 'Graph health check',
    status: 'completed',
    cron: '*/30 * * * *',
    hoursAgo: 0.2,
    records: 88,
    durationMs: 640,
  },
  {
    id: 'schema-migrate',
    name: 'Schema migrate — snapshot v3',
    status: 'completed',
    cron: '0 0 * * 1',
    hoursAgo: 80,
    records: 4,
    durationMs: 12000,
  },
]

function daysAgoISO(days, hour = 12, minute = 0) {
  const d = new Date('2026-08-14T12:00:00.000Z')
  d.setUTCDate(d.getUTCDate() - days)
  d.setUTCHours(hour, minute, 0, 0)
  return d.toISOString()
}

function hoursAgoISO(hours) {
  const d = new Date('2026-08-14T12:00:00.000Z')
  d.setTime(d.getTime() - hours * 3600 * 1000)
  return d.toISOString()
}

function main() {
  const communityByLabel = new Map()
  for (const c of COMMUNITIES) {
    for (const label of c.labels) communityByLabel.set(label, c.id)
  }

  const missingCommunity = RAW_NODES.filter(([label]) => !communityByLabel.has(label))
  if (missingCommunity.length) {
    throw new Error(`Nodes missing community: ${missingCommunity.map((n) => n[0]).join(', ')}`)
  }

  const assigned = new Set(COMMUNITIES.flatMap((c) => c.labels))
  const unknown = [...assigned].filter((l) => !RAW_NODES.some(([n]) => n === l))
  if (unknown.length) {
    throw new Error(`Community labels not in nodes: ${unknown.join(', ')}`)
  }

  const idOf = (label) => slug(label)
  const nodesSeed = RAW_NODES.map(([label, category, description]) => ({
    id: idOf(label),
    label,
    category,
    description,
    communityId: communityByLabel.get(label),
  }))

  const byLabel = new Map(nodesSeed.map((n) => [n.label, n]))
  const byId = new Map(nodesSeed.map((n) => [n.id, n]))
  const ids = nodesSeed.map((n) => n.id)
  const byCommunity = new Map()
  for (const n of nodesSeed) {
    if (!byCommunity.has(n.communityId)) byCommunity.set(n.communityId, [])
    byCommunity.get(n.communityId).push(n.id)
  }

  const edges = new Map()

  function addEdge(aLabel, bLabel, weight) {
    const a = typeof aLabel === 'string' && byLabel.has(aLabel) ? byLabel.get(aLabel).id : aLabel
    const b = typeof bLabel === 'string' && byLabel.has(bLabel) ? byLabel.get(bLabel).id : bLabel
    if (!byId.has(a) || !byId.has(b) || a === b) return
    const k = edgeKey(a, b)
    const prev = edges.get(k)
    if (prev) {
      prev.weight = Math.max(prev.weight, weight)
      return
    }
    edges.set(k, { source: a, target: b, weight: Math.max(1, Math.round(weight)) })
  }

  for (const [a, b, w] of HERO) addEdge(a, b, w)
  for (const [a, b, w] of AFFINITY) addEdge(a, b, w)

  // Dense intra-community backbone
  for (const [, members] of byCommunity) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (rand() < 0.72) {
          const w = 4 + Math.floor(Math.pow(rand(), 1.6) * 48)
          addEdge(members[i], members[j], w)
        }
      }
    }
  }

  // Hub attachments — a few operational hubs pull the graph together
  const hubs = [
    'exceptions',
    'milestones',
    'invoices',
    'charges',
    'route',
    'containers',
    'shipment_documents',
    'external_messages',
    'document_extraction',
    'quotes',
  ]
  for (const hub of hubs) {
    for (const id of ids) {
      if (id === hub) continue
      if (rand() < 0.38) {
        const w = 2 + Math.floor(Math.pow(rand(), 2.1) * 36)
        addEdge(hub, id, w)
      }
    }
  }

  // Cross-community residual edges to reach ~1400
  let guard = 0
  while (edges.size < 1412 && guard < 80000) {
    guard += 1
    const a = ids[irand(0, ids.length - 1)]
    const b = ids[irand(0, ids.length - 1)]
    if (a === b) continue
    const same = byId.get(a).communityId === byId.get(b).communityId
    if (!same && rand() < 0.35) continue
    const w = 1 + Math.floor(Math.pow(rand(), 2.4) * (same ? 28 : 16))
    addEdge(a, b, w)
  }

  // Cap non-hero weights so the advertised strongest links stay on top
  const heroKeys = new Set(
    HERO.map(([a, b]) => edgeKey(idOf(a), idOf(b))),
  )
  for (const [k, e] of edges) {
    if (!heroKeys.has(k) && e.weight >= 91) e.weight = 70 + irand(0, 18)
  }

  const links = [...edges.values()].sort((x, y) => y.weight - x.weight)

  const wdeg = new Map()
  const deg = new Map()
  for (const id of ids) {
    wdeg.set(id, 0)
    deg.set(id, 0)
  }
  for (const l of links) {
    wdeg.set(l.source, wdeg.get(l.source) + l.weight)
    wdeg.set(l.target, wdeg.get(l.target) + l.weight)
    deg.set(l.source, deg.get(l.source) + 1)
    deg.set(l.target, deg.get(l.target) + 1)
  }
  const maxW = Math.max(...wdeg.values())

  const nodes = nodesSeed.map((n) => {
    const w = wdeg.get(n.id)
    const norm = Math.sqrt(w / maxW)
    const size =
      n.category === 'finance'
        ? +(5 + norm * 9).toFixed(2)
        : +(8 + norm * 36).toFixed(2)
    const base = 6 + Math.round(norm * 28)
    const trend = Array.from({ length: 16 }, (_, i) => {
      const season = 0.75 + 0.35 * Math.sin((i / 16) * Math.PI * 2)
      const noise = 0.65 + rand() * 0.7
      return Math.max(0, Math.round(base * season * noise))
    })
    return {
      ...n,
      size,
      degree: deg.get(n.id),
      trend,
    }
  })

  const communities = COMMUNITIES.map((c) => {
    const memberIds = c.labels.map(idOf)
    const memberSet = new Set(memberIds)
    let internalLinks = 0
    for (const l of links) {
      if (memberSet.has(l.source) && memberSet.has(l.target)) internalLinks += 1
    }
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      nodeIds: memberIds,
      internalLinks,
    }
  })

  const knowledge = KNOWLEDGE.map((k, i) => ({
    id: `learn_${String(i + 1).padStart(3, '0')}`,
    text: k.text,
    nodeIds: k.nodes.map(idOf),
    source: k.source,
    updatedAt: daysAgoISO(k.daysAgo, 8 + (i % 10), (i * 7) % 60),
    category: k.category,
  }))

  const devwork = DEVWORK.map((e, i) => ({
    id: `dev_${String(i + 1).padStart(3, '0')}`,
    title: e.title,
    detail: e.detail,
    kind: e.kind,
    at: daysAgoISO(e.daysAgo, e.hour, 12 + i),
  }))

  const jobs = JOBS.map((j) => ({
    id: j.id,
    name: j.name,
    status: j.status,
    cron: j.cron,
    lastRun: hoursAgoISO(j.hoursAgo),
    records: j.records,
    durationMs: j.durationMs,
  }))

  const snapshot = {
    generatedAt: '2026-08-14T12:00:00.000Z',
    nodes,
    links,
    knowledge,
    communities,
    devwork,
    jobs,
  }

  const outDir = path.join(__dirname, '..', 'src', 'data')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'snapshot.json')
  fs.writeFileSync(outFile, JSON.stringify(snapshot))

  const top = links.slice(0, 12).map((l) => {
    const a = byId.get(l.source).label
    const b = byId.get(l.target).label
    return `${a} ↔ ${b} (${l.weight})`
  })

  console.log(
    JSON.stringify(
      {
        nodes: nodes.length,
        links: links.length,
        knowledge: knowledge.length,
        communities: communities.length,
        avgDegree: +(
          nodes.reduce((s, n) => s + n.degree, 0) / nodes.length
        ).toFixed(1),
        top,
        outFile,
      },
      null,
      2,
    ),
  )
}

main()

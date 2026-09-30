export interface PortfolioProject {
  slug: string
  title: string
  category: string
  summary: string
  role: string
  context: string
  problem: string
  approach: string
  workflow: string[]
  decisions: string[]
  implementation: string[]
  outcome: string
  featured: boolean
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'bitfuse',
    title: 'Bitfuse',
    category: 'Fintech · Digital payments',
    summary:
      'A digital payments platform shaped around the connected work of identity checks, wallets, transaction records and payment verification.',
    role: 'Product and systems engineering',
    context:
      'Digital payments depend on more than a transfer button. Identity, payment status, wallet balances and financial records need to make sense together across a complete transaction lifecycle.',
    problem:
      'The product needs to support KYC, payment initiation and verification, wallet activity and a ledger model without treating those concerns as separate screens or disconnected services.',
    approach:
      'Frame the product around explicit actors, transaction states and trustworthy records. Keep identity review distinct from payment processing, then make each state legible to the API and the people operating the system.',
    workflow: ['KYC review', 'Payment intent', 'Verification', 'Ledger entry', 'Wallet view'],
    decisions: [
      'Model the transaction lifecycle explicitly so a pending, verified or failed payment is not mistaken for a completed one.',
      'Treat the ledger as the record of financial movement; derive wallet views from recorded activity rather than an unexplained balance change.',
      'Keep verification and operational review visible in the API workflow, with security considered at the system boundary.',
    ],
    implementation: [
      'Product scope covers KYC workflow, transaction lifecycle, wallets, ledger architecture, payment verification and API/backend architecture.',
      'Security and operational considerations are part of the system design, not an afterthought to the payment interface.',
    ],
    outcome:
      'A systems-focused fintech case study documenting the product areas and engineering questions that shape a dependable payments platform.',
    featured: true,
  },
  {
    slug: 'academic-certificate-verification',
    title: 'Decentralized Academic Certificate Verification System',
    category: 'Education · Verification',
    summary:
      'A verification concept for Malawi higher education that connects document processing, QR/barcode access and a checkable certificate record.',
    role: 'Requirements, system design and implementation',
    context:
      'In Malawi’s higher-education context, certificate checks involve graduates, institutions and people who need to verify a qualification. The verification journey should work for each of those stakeholders.',
    problem:
      'A paper certificate alone makes remote checks difficult. A digital flow needs to connect the document to a clear verification result while respecting the responsibilities of the issuing institution.',
    approach:
      'Treat the certificate as a document with a verifiable reference. Connect document processing and issuance to a QR/barcode lookup, and make the verification result understandable to the person checking it.',
    workflow: [
      'Institution prepares record',
      'Document is processed',
      'Certificate receives QR/barcode',
      'Verifier scans reference',
      'System returns verification',
    ],
    decisions: [
      'Make the verification path usable from the certificate itself, without requiring the verifier to understand the underlying technology.',
      'Keep the issuing institution and certificate record central to the trust model.',
      'Describe decentralization as the verification concept; do not imply a specific ledger or consensus implementation where one is not documented.',
    ],
    implementation: [
      'Project scope includes document processing, QR/barcode verification, stakeholder workflows, backend/API architecture and frontend implementation.',
      'The decentralized verification concept is presented alongside the practical issuance and checking workflow.',
    ],
    outcome:
      'A system-design case study focused on making academic certificate checks clearer and more accessible across institutional boundaries.',
    featured: true,
  },
  {
    slug: 'life-compass',
    title: 'Life Compass / Life OS',
    category: 'Personal systems · Product design',
    summary:
      'A personal planning and execution system that connects long-range direction to the tasks and calendar decisions of everyday work.',
    role: 'Product and system design',
    context:
      'Personal goals span different timescales. A planning tool is useful when a daily task can be understood in relation to a project, a season and a longer-term direction.',
    problem:
      'Vision, goals, projects, tasks and calendar events are often managed separately, making it hard to see whether day-to-day execution supports the larger plan.',
    approach:
      'Use a consistent hierarchy and explicit relationships so plans can move from broad intent to concrete work, then return to the calendar as an execution surface.',
    workflow: ['Vision', 'Season', '5-year', 'Annual', 'Monthly', 'Project', 'Task'],
    decisions: [
      'Keep the planning levels connected instead of treating goals, projects and tasks as unrelated lists.',
      'Use the calendar to support execution while keeping the plan’s higher-level context visible.',
      'Make the system useful as a personal operating model, not just a collection of productivity features.',
    ],
    implementation: [
      'The documented structure links vision, season, five-year, annual, monthly, project and task horizons.',
      'The product design centers goal/task/project relationships and a calendar-based execution workflow.',
    ],
    outcome:
      'A product and system-design project for connecting personal direction with practical, scheduled execution.',
    featured: true,
  },
  {
    slug: 'nacit-website',
    title: 'NACIT Website',
    category: 'Institutional systems · Web',
    summary:
      'An institutional digital system shaped by understanding the needs of NACIT administrators and students, then translating them into an implementable structure.',
    role: 'Requirements analysis and system implementation',
    context:
      'An institutional website serves different people with different tasks. Administrators need a manageable way to present information; students need a coherent way to find and use it.',
    problem:
      'The work is not simply to produce pages. Requirements, audience needs, content relationships and implementation have to fit together in a system the institution can use.',
    approach:
      'Start with the people and information the site must support. Use those requirements to shape the information architecture, then implement the resulting system rather than treating interface styling as the whole project.',
    workflow: [
      'Understand administrator and student needs',
      'Translate requirements',
      'Organize information',
      'Implement the website',
      'Deliver the system',
    ],
    decisions: [
      'Use user needs and requirements to guide the information architecture.',
      'Treat content structure and administration needs as system concerns, not late-stage page details.',
      'Keep implementation accountable to the original requirements and intended users.',
    ],
    implementation: [
      'The project connects requirements analysis, users, information architecture, implementation and delivery.',
      'The current project record does not include specific platform, feature or adoption metrics, so none are claimed here.',
    ],
    outcome:
      'A professional project demonstrating the path from institutional requirements to a delivered digital system.',
    featured: false,
  },
  {
    slug: 'escom-power-schedule-api',
    title: 'ESCOM Power Schedule API',
    category: 'API · Data integration',
    summary:
      'A focused technical project centered on retrieving power-schedule information and making it useful through an API.',
    role: 'API and integration engineering',
    context:
      'Power-schedule information is most useful when it can be retrieved consistently and consumed by another system or interface.',
    problem:
      'The technical work is to connect the available schedule data to a dependable, usable interface rather than leave it as information that is difficult to integrate.',
    approach:
      'Keep the scope centered on the path from schedule data to an API consumer: retrieval, integration, a clear response shape and the utility that follows.',
    workflow: ['Schedule data', 'Retrieval / integration', 'API response', 'Consuming system'],
    decisions: [
      'Treat the API contract as the boundary between the schedule source and the consuming experience.',
      'Keep the implementation focused on access to useful schedule data.',
    ],
    implementation: [
      'The project is documented as an API with data retrieval/integration and system utility as its focus.',
      'Specific upstream contracts, operational metrics and deployment details are not asserted here.',
    ],
    outcome:
      'A smaller technical project showing practical API and data-integration work.',
    featured: false,
  },
]

export const capabilities = [
  {
    title: 'Understand',
    description: 'Requirements, user needs, operating context and the problem a system must solve.',
  },
  {
    title: 'Design',
    description: 'Information architecture, workflows, domain concepts and system boundaries.',
  },
  {
    title: 'Build',
    description: 'Web interfaces, backend services, APIs and the data structures that connect them.',
  },
  {
    title: 'Deliver',
    description: 'A usable system with clear behavior, considered security and practical operations.',
  },
]

export const technicalCapabilities = [
  { area: 'Product & systems', items: 'Requirements analysis · Workflow design · Information architecture' },
  { area: 'Backend & APIs', items: 'API design · Django · Laravel · Python · PHP' },
  { area: 'Data', items: 'Relational data · PostgreSQL · MySQL · Redis' },
  { area: 'Frontend', items: 'React · Next.js · TypeScript · Responsive interfaces' },
]

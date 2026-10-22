export interface PolicyClause {
  id: string
  title: string
  description: string
  tags?: string[]
}

export interface PolicySection {
  id: string
  number: string
  title: string
  summary: string
  paragraphs: string[]
  clauses?: PolicyClause[]
  badge?: string
  guaranteeNote?: string
}

export const POLICY_METADATA = {
  version: "2.4.0",
  effectiveDate: "October 2026",
  lastAudited: "October 2026",
  classification: "Public Transparency Protocol",
  securityTier: "Enterprise / Zero-Retention Aligned",
  dpoContact: "privacy@shaft.build",
  securityContact: "security@shaft.build",
}

export const CORE_TENETS = [
  {
    icon: "EyeOff",
    title: "Zero Foundation Model Training",
    description: "Your proprietary code, commit histories, prompt contents, and deployment outputs are strictly NEVER used to train, fine-tune, or calibrate public AI foundation models.",
  },
  {
    icon: "ShieldCheck",
    title: "Minimal Persistent Footprint",
    description: "Shaft is a command center, not a code storage vault. Source code stays in your GitHub repositories; we only inspect telemetry and states on-demand.",
  },
  {
    icon: "Lock",
    title: "Military-Grade Token Vault",
    description: "All OAuth tokens, Vercel keys, and database secrets are encrypted with AES-256-GCM at rest and transported strictly over TLS 1.3 with strict isolation.",
  },
  {
    icon: "RefreshCw",
    title: "Instant Self-Serve Erasure",
    description: "Disconnecting any repository or deleting your Shaft profile executes an immediate, deterministic purge of all associated tokens, logs, and cached references.",
  },
]

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "zero-training",
    number: "01",
    badge: "Core AI Tenet",
    title: "Zero Foundation Model Training Guarantee",
    summary:
      "Shaft's bedrock promise: Your intellectual property, source code, and developer instructions remain exclusively yours. We strictly reject data mining and training on customer work.",
    paragraphs: [
      "Shaft unifies your developer workflow across code repositories, serverless hosting, databases, and generative AI systems. We believe an engineering cockpit must hold the highest standard of intellectual property protection.",
      "Under no circumstances does Shaft sell, license, or provide your source code, configuration files, commit histories, prompt queries, or debugging diagnostics to any AI model developer (including OpenAI, Anthropic, Google Cloud, or open-weight model consortia) for model training or evaluation.",
      "All automated AI interactions within Shaft execute through dedicated commercial enterprise API tiers bound by legally enforceable Zero Data Retention (ZDR) and strict confidentiality agreements. Your code never becomes training weights.",
    ],
    guaranteeNote:
      "Shaft contractually enforces zero-training agreements across all integrated LLM inference partners. Opt-in privacy mode is active by default for all accounts.",
    clauses: [
      {
        id: "stateless-inference",
        title: "Stateless Context Routing",
        description:
          "Contextual code snippets sent during AI queries are held ephemerally in RAM during inference execution and discarded immediately upon response delivery.",
        tags: ["Ephemeral Memory", "No Disk Persistence", "Zero Spill"],
      },
      {
        id: "vector-isolation",
        title: "Zero Shared Vector Embeddings",
        description:
          "Shaft does not index your repository contents into shared or public vector databases. Any workspace semantic indexing remains isolated to your tenant and encrypted.",
        tags: ["Tenant Isolation", "Private Index", "AES-256"],
      },
    ],
  },
  {
    id: "data-collection",
    number: "02",
    badge: "Information Architecture",
    title: "Information We Collect & Scoped Permissions",
    summary:
      "We operate under strict data minimization. Shaft only collects the exact metadata required to synchronize your developer cockpit across connected platforms.",
    paragraphs: [
      "To provide unified visibility across your engineering stack, Shaft interfaces with third-party developer platforms upon your explicit authorization.",
      "We intentionally restrict our data collection to high-level project telemetry, metadata, and scoped authentication tokens. We do not mirror entire git repositories onto persistent application servers.",
    ],
    clauses: [
      {
        id: "account-data",
        title: "Identity & Account Credentials",
        description:
          "When authenticating via GitHub OAuth, we obtain your verified email address, public GitHub username, user ID, and avatar URI to establish your account identity.",
        tags: ["GitHub OAuth", "Email Verification", "Profile"],
      },
      {
        id: "scoped-tokens",
        title: "Scoped Third-Party OAuth Tokens",
        description:
          "We store encrypted OAuth 2.0 access tokens for GitHub and Vercel. We request strictly minimal scopes (e.g. 'repo:status', 'read:user', 'deployments') necessary to display commit streams and deployment statuses.",
        tags: ["Minimal Scopes", "OAuth 2.0", "Encrypted Vault"],
      },
      {
        id: "telemetry-metadata",
        title: "Telemetry & Pipeline Metadata",
        description:
          "Shaft processes branch names, commit hashes, release tags, Vercel build durations, deployment URLs, and database health status pings to render real-time dashboard cards.",
        tags: ["Commit SHAs", "Build Metrics", "Latency Records"],
      },
      {
        id: "ai-inquiries",
        title: "User Queries & Prompt Transcripts",
        description:
          "Questions submitted to the Shaft command center (such as 'Why did the latest production build fail?') and the generated diagnostic answers are retained temporarily to maintain conversation continuity.",
        tags: ["Command Bar", "Diagnostic Logs", "30-Day Expiry"],
      },
    ],
  },
  {
    id: "data-usage",
    number: "03",
    badge: "Processing & Purpose",
    title: "How We Process & Leverage Your Data",
    summary:
      "Every byte of processed data directly serves your developer experience: unifying your multi-tab dashboard, diagnosing build failures, and providing intelligent project telemetry.",
    paragraphs: [
      "We do not monetize your data, participate in programmatic ad networks, or share user behavior with cross-site tracking brokers.",
      "The information we process is strictly restricted to fulfilling our service commitments to you:",
    ],
    clauses: [
      {
        id: "unified-dashboard",
        title: "Cockpit Synchronization",
        description:
          "Aggregating live statuses from GitHub commits, Vercel edge deployments, and database health indicators so you can monitor your entire stack in one browser tab.",
        tags: ["Dashboard", "Real-Time Sync", "Webhook Relays"],
      },
      {
        id: "proactive-diagnostics",
        title: "Autonomous Error Detection",
        description:
          "Analyzing build outputs and edge logs to pinpoint compilation bottlenecks, broken dependency trees, or configuration mismatches before they hit production.",
        tags: ["Build Insights", "Early Warning", "Vite/Next Diagnostics"],
      },
      {
        id: "multi-model-orchestration",
        title: "Context Handoff Between AI Models",
        description:
          "Preserving project context when you switch between different reasoning models, eliminating the friction of re-explaining architecture and environment variables.",
        tags: ["Model Continuity", "Context Handoff", "Multi-LLM"],
      },
      {
        id: "security-auditing",
        title: "Platform Security & Rate Limiting",
        description:
          "Monitoring IP addresses and request volumes strictly to prevent brute-force intrusion, token scraping, API abuse, and distributed denial-of-service (DDoS) incidents.",
        tags: ["DDoS Defense", "Rate Limiting", "Access Audits"],
      },
    ],
  },
  {
    id: "subprocessors",
    number: "04",
    badge: "Infrastructure",
    title: "Third-Party Subprocessors & Cloud Ecosystem",
    summary:
      "Shaft partners with tier-1 cloud and AI providers under comprehensive Data Processing Addendums (DPAs) with strict security covenants.",
    paragraphs: [
      "To deliver our globally distributed edge architecture and AI capabilities, Shaft relies on vetted third-party subprocessors. Each vendor undergoes rigorous technical and legal security reviews.",
      "All subprocessors are contractually bound to process data only on our instructions, uphold strict confidentiality, and enforce modern cryptographic protections.",
    ],
    clauses: [
      {
        id: "vercel-subprocessor",
        title: "Vercel Inc. — Edge Network & Hosting",
        description:
          "Powers our global edge distribution, static bundle delivery, and edge function middleware across global regions with low-latency TLS termination.",
        tags: ["Edge CDN", "Serverless Compute", "SOC 2 Type II"],
      },
      {
        id: "github-subprocessor",
        title: "GitHub Inc. — Source Control Integration",
        description:
          "Provides repository synchronization, developer identity verification, and webhook event notifications via official REST & GraphQL APIs.",
        tags: ["OAuth Provider", "Webhook Ingestion", "Enterprise Security"],
      },
      {
        id: "cloud-storage-subprocessor",
        title: "AWS & Google Cloud — Encrypted Backend Infrastructure",
        description:
          "Hosts our primary application databases, Redis session caches, and encryption key vaults across multi-zone redundant clusters.",
        tags: ["Database Hosting", "KMS Key Vaults", "ISO 27001"],
      },
      {
        id: "ai-inference-subprocessor",
        title: "Anthropic, OpenAI & Google Cloud Vertex — Stateless Inference",
        description:
          "Executes developer queries through enterprise API endpoints protected by non-training, zero-data-retention commercial covenants.",
        tags: ["Zero Data Retention", "Enterprise API", "No Training"],
      },
    ],
  },
  {
    id: "security",
    number: "05",
    badge: "Cryptographic Architecture",
    title: "Security Architecture, Key Vaults & Encryption",
    summary:
      "We treat your developer credentials like cryptographic crown jewels. Multi-layered defense, envelope encryption, and automatic token expiry are baked into our core.",
    paragraphs: [
      "Security is not an afterthought in Shaft; it is the fundamental constraint under which our architecture operates.",
      "We implement defense-in-depth methodologies across application layers, network boundaries, and developer credentials.",
    ],
    clauses: [
      {
        id: "encryption-at-rest",
        title: "AES-256-GCM Envelope Encryption",
        description:
          "All stored third-party OAuth access tokens and sensitive environment variable references are encrypted using AES-256-GCM with hardware-backed key rotation.",
        tags: ["AES-256-GCM", "Envelope KMS", "Zero Plaintext"],
      },
      {
        id: "encryption-in-transit",
        title: "Strict TLS 1.3 Transmission",
        description:
          "All data transmitted between your browser, our edge nodes, and downstream APIs is encrypted via TLS 1.3 with Perfect Forward Secrecy (PFS) and strict HSTS headers.",
        tags: ["TLS 1.3", "PFS", "HSTS Preload"],
      },
      {
        id: "token-isolation",
        title: "Cryptographic Tenant Isolation",
        description:
          "Credential records are strictly partitioned by cryptographic tenant IDs. Database queries enforce row-level security (RLS) preventing cross-tenant access.",
        tags: ["Row-Level Security", "Tenant Walls", "Principle of Least Privilege"],
      },
      {
        id: "automated-revocation",
        title: "Deterministic Credential Purge",
        description:
          "Whenever you disconnect a repository or revoke OAuth permissions in GitHub/Vercel, Shaft immediately invalidates and shreds all associated encrypted tokens.",
        tags: ["Immediate Shred", "OAuth Webhooks", "Zero Zombie Tokens"],
      },
    ],
  },
  {
    id: "retention",
    number: "06",
    badge: "Lifecycle & Deletion",
    title: "Data Retention Schedules & Right to Erasure",
    summary:
      "We keep your data only for as long as you actively use Shaft. You possess absolute ownership and the right to permanently purge your records at any time.",
    paragraphs: [
      "Shaft adheres to a strict data lifecycle management policy. When telemetry reaches the end of its useful diagnostic window, it is systematically deleted.",
      "You do not need to file a formal legal ticket or navigate support hurdles to delete your data. Full self-serve deletion controls are available directly in your account.",
    ],
    clauses: [
      {
        id: "telemetry-schedule",
        title: "30-Day Rolling Diagnostic Retention",
        description:
          "Deployment logs, latency statistics, and error traces are automatically purged after 30 days on a rolling basis.",
        tags: ["Rolling Purge", "30-Day Window", "Automated Cleanup"],
      },
      {
        id: "session-schedule",
        title: "Ephemeral Session Invalidation",
        description:
          "Developer authentication sessions expire after 7 days of inactivity, requiring re-authentication to refresh security credentials.",
        tags: ["7-Day Timeout", "Secure Cookies", "Auto-Expiration"],
      },
      {
        id: "erasure-right",
        title: "Instant Self-Serve Account Deletion",
        description:
          "Deleting your Shaft account initiates an immediate, synchronous deletion cascade across all database tables, caches, and backups.",
        tags: ["GDPR Art. 17", "CCPA Deletion", "Cascade Purge"],
      },
    ],
  },
  {
    id: "cookies",
    number: "07",
    badge: "Local State",
    title: "Cookies, Browser Storage & Privacy Mode",
    summary:
      "Zero tracking cookies. Zero behavioral advertising pixels. We only utilize strictly necessary browser storage to maintain your session and UI preferences.",
    paragraphs: [
      "We believe that developer tooling should never double as an advertising vehicle. Shaft does not load Google Analytics, Facebook Pixel, or cross-site tracking scripts.",
      "Our usage of browser storage is limited exclusively to technical operational requirements:",
    ],
    clauses: [
      {
        id: "session-cookie",
        title: "Essential Session Cookies",
        description:
          "Encrypted, HTTP-only, SameSite=Strict cookies used exclusively to verify developer authentication across page navigation.",
        tags: ["HttpOnly", "SameSite=Strict", "Secure Only"],
      },
      {
        id: "local-storage",
        title: "Client-Side Local Storage",
        description:
          "Used to remember client interface preferences: typewriter animation speed, muted audio preferences, sidebar expansion, and theme settings.",
        tags: ["Zero Tracking", "Client-Side Only", "Preferences"],
      },
    ],
  },
  {
    id: "compliance",
    number: "08",
    badge: "Legal Rights & Contact",
    title: "Global Compliance (GDPR, CCPA) & Official Contact",
    summary:
      "Shaft operates in compliance with international privacy statutes including GDPR (Europe), UK GDPR, and CCPA/CPRA (California). Our security team is directly reachable.",
    paragraphs: [
      "Depending on your geographic jurisdiction, you hold enforceable rights regarding your personal information, including the right to access, rectify, export, or restrict processing.",
      "Shaft is based on transparent, honest engineering. If you ever have a concern regarding your code security, model interactions, or stored credentials, our security engineering team will respond directly.",
    ],
    clauses: [
      {
        id: "gdpr-rights",
        title: "European Union & UK GDPR Rights",
        description:
          "You have the right to request access to your data (Article 15), rectification of inaccurate details (Article 16), erasure (Article 17), and data portability (Article 20).",
        tags: ["GDPR Articles 15-22", "EEA Compliant", "Data Portability"],
      },
      {
        id: "ccpa-rights",
        title: "California Consumer Privacy Act (CCPA/CPRA)",
        description:
          "We do not 'sell' or 'share' your personal information as defined by California law. You retain the right to non-discrimination for exercising your privacy privileges.",
        tags: ["CCPA Compliant", "No Sale of Data", "CPRA Aligned"],
      },
      {
        id: "dpo-contact",
        title: "Dedicated Security & Privacy Inquiries",
        description:
          "Direct all formal privacy questions, data export requests, or security disclosures to our dedicated engineers at privacy@shaft.build and security@shaft.build.",
        tags: ["Human Response", "Security Team", "privacy@shaft.build"],
      },
    ],
  },
]

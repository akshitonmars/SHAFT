import React, { useState } from 'react';
import {
  Activity,
  Bot,
  GitBranch,
  Server,
  Rocket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface HeroProps {
  previewRef?: React.RefObject<HTMLDivElement>;
}

export const Hero: React.FC<HeroProps> = ({ previewRef }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'ai' | 'repo' | 'backend' | 'deploy'>('all');

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32" id="product">
      {/* Subtle background ambient grid (clean & restrained, no distracting orbs) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #78CFC4 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Editorial Brand Header & Vision */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            YOUR PROJECT. ONE COMMAND CENTER.
          </div>

          {/* Headline */}
          <h1 className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-brand-light leading-[1.12]">
            Your entire project.
            <br />
            <span className="italic text-brand-accent/95">Finally, in one place.</span>
          </h1>

          {/* Supporting text */}
          <p className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-brand-muted max-w-2xl mx-auto">
            Connect your AI tools, code, backend, and deployments. Understand
            what's happening across your project and know what needs attention next.
          </p>

          {/* Mission Tagline Micro-Banner (About anchor) */}
          <div id="about" className="mt-4 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-brand-muted/80">
            <span>SHAFT</span>
            <span>·</span>
            <span>Build Beyond Ideas.</span>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#workspace-preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-brand-accent px-7 py-3.5 text-sm font-semibold text-brand-dark transition-all hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark shadow-sm hover:translate-y-[-1px]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#workspace-preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-brand-border bg-brand-surface/70 px-7 py-3.5 text-sm font-medium text-brand-light transition-all hover:bg-brand-elevated hover:border-brand-borderLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Explore SHAFT
            </a>
          </div>
        </div>

        {/* Workspace Preview Container */}
        <div
          id="workspace-preview"
          ref={previewRef}
          tabIndex={-1}
          className="mt-16 md:mt-24 rounded-xl border border-brand-border bg-brand-surface/90 shadow-2xl overflow-hidden focus:outline-none"
        >
          {/* Top Window Chrome / Status Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-brand-border bg-brand-dark/95 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Window control dots */}
              <div className="flex items-center space-x-1.5" aria-hidden="true">
                <div className="h-2.5 w-2.5 rounded-full bg-[#343D46]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#343D46]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#343D46]" />
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-brand-border" />
              <div className="flex items-center gap-2 text-xs font-mono text-brand-muted">
                <Terminal className="h-3.5 w-3.5 text-brand-accent" />
                <span>shaft-command-center</span>
                <span className="text-brand-border">/</span>
                <span className="text-brand-light font-medium">workspace-preview</span>
              </div>
            </div>

            {/* Clear Static Design Demo Notice */}
            <div className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted">
              <Info className="h-3.5 w-3.5 text-brand-accent" />
              <span>Static Design Preview · Illustrative Demo Content</span>
            </div>
          </div>

          {/* Sub-navigation / Area filter buttons */}
          <div
            id="integrations"
            className="flex items-center overflow-x-auto border-b border-brand-border bg-brand-surface/50 px-4 py-2 sm:px-6 scrollbar-none"
            role="tablist"
            aria-label="Workspace areas preview"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted mr-3 hidden lg:inline-block">
              Areas:
            </span>
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'overview', label: 'Project Overview' },
              { id: 'ai', label: 'AI Activity' },
              { id: 'repo', label: 'Repository' },
              { id: 'backend', label: 'Backend' },
              { id: 'deploy', label: 'Deployments' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30'
                    : 'text-brand-muted hover:text-brand-light hover:bg-brand-elevated/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Preview Grid */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Grid Row 1: Overview & Deployments */}
            {(activeTab === 'all' || activeTab === 'overview' || activeTab === 'deploy') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Project Overview Area */}
                {(activeTab === 'all' || activeTab === 'overview') && (
                  <div className={`rounded-lg border border-brand-border bg-brand-elevated/40 p-5 ${activeTab === 'all' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded p-1.5 bg-brand-accent/10 text-brand-accent">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-brand-light">Project Overview</h2>
                          <p className="text-xs text-brand-muted">Unified health & milestone tracking</p>
                        </div>
                      </div>
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        Operational (Demo)
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <span className="text-[11px] uppercase tracking-wider text-brand-muted">Active Pipeline</span>
                        <p className="mt-1 text-base font-semibold text-brand-light">Sprint 01</p>
                        <span className="text-[11px] text-brand-accent">Initial Foundation</span>
                      </div>
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <span className="text-[11px] uppercase tracking-wider text-brand-muted">Tasks In Flight</span>
                        <p className="mt-1 text-base font-semibold text-brand-light">3 of 3</p>
                        <span className="text-[11px] text-brand-muted">Ready for review</span>
                      </div>
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <span className="text-[11px] uppercase tracking-wider text-brand-muted">Code Coverage</span>
                        <p className="mt-1 text-base font-semibold text-brand-light">94.2%</p>
                        <span className="text-[11px] text-emerald-400">Target surpassed</span>
                      </div>
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <span className="text-[11px] uppercase tracking-wider text-brand-muted">Build Latency</span>
                        <p className="mt-1 text-base font-semibold text-brand-light">1.4s</p>
                        <span className="text-[11px] text-emerald-400">Vite optimized</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Deployments Area */}
                {(activeTab === 'all' || activeTab === 'deploy') && (
                  <div className={`rounded-lg border border-brand-border bg-brand-elevated/40 p-5 ${activeTab === 'deploy' ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded p-1.5 bg-brand-accent/10 text-brand-accent">
                          <Rocket className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-brand-light">Deployments</h2>
                          <p className="text-xs text-brand-muted">Hosting & edge pipelines</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-brand-muted">Vercel Edge</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-brand-light">Production Branch</span>
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="h-3 w-3" /> Live
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-brand-muted font-mono">
                          <span>main @ shaft</span>
                          <span className="text-brand-accent">SHA-256 Verified</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-brand-muted px-1">
                        <span>Auto-deploy on push:</span>
                        <span className="font-semibold text-brand-light">Enabled</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grid Row 2: AI Activity, Repository & Backend */}
            {(activeTab === 'all' || activeTab === 'ai' || activeTab === 'repo' || activeTab === 'backend') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 2. AI Activity Area */}
                {(activeTab === 'all' || activeTab === 'ai') && (
                  <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-5">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded p-1.5 bg-brand-accent/10 text-brand-accent">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-brand-light">AI Activity</h2>
                          <p className="text-xs text-brand-muted">Autonomous coding & audits</p>
                        </div>
                      </div>
                      <Sparkles className="h-3.5 w-3.5 text-brand-accent/70" />
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <div className="rounded border border-brand-border/50 bg-brand-dark/40 p-2.5 text-xs">
                        <div className="flex items-center justify-between text-brand-light font-medium">
                          <span>Architecture Validator</span>
                          <span className="text-[10px] text-brand-accent">Completed</span>
                        </div>
                        <p className="mt-1 text-[11px] text-brand-muted">
                          Verified bundle tree & zero layout regressions
                        </p>
                      </div>

                      <div className="rounded border border-brand-border/50 bg-brand-dark/40 p-2.5 text-xs">
                        <div className="flex items-center justify-between text-brand-light font-medium">
                          <span>Accessibility Scanner</span>
                          <span className="text-[10px] text-emerald-400">100% Score</span>
                        </div>
                        <p className="mt-1 text-[11px] text-brand-muted">
                          Keyboard navigation & ARIA landmarks checked
                        </p>
                      </div>

                      <div className="rounded border border-brand-border/50 bg-brand-dark/40 p-2.5 text-xs">
                        <div className="flex items-center justify-between text-brand-light font-medium">
                          <span>Dependency Audit</span>
                          <span className="text-[10px] text-brand-muted">Idle</span>
                        </div>
                        <p className="mt-1 text-[11px] text-brand-muted">
                          Zero extraneous runtime overhead
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Repository Area */}
                {(activeTab === 'all' || activeTab === 'repo') && (
                  <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-5">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded p-1.5 bg-brand-accent/10 text-brand-accent">
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-brand-light">Repository</h2>
                          <p className="text-xs text-brand-muted">Source control & CI sync</p>
                        </div>
                      </div>
                      <ShieldCheck className="h-4 w-4 text-brand-accent" />
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between rounded border border-brand-border/60 bg-brand-dark/40 p-3">
                        <div>
                          <span className="text-[11px] text-brand-muted">Active Branch</span>
                          <p className="font-mono font-medium text-brand-light">main</p>
                        </div>
                        <span className="rounded bg-brand-accent/10 px-2 py-0.5 text-[10px] font-medium text-brand-accent">
                          Clean Tree
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-brand-muted">
                        <div className="flex justify-between">
                          <span>Remote URL:</span>
                          <span className="font-mono text-brand-light truncate max-w-[170px]">
                            akshitonmars/SHAFT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sync Status:</span>
                          <span className="text-emerald-400">Up to date</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TypeScript Strict:</span>
                          <span className="text-brand-light font-medium">Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Backend Area */}
                {(activeTab === 'all' || activeTab === 'backend') && (
                  <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-5">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded p-1.5 bg-brand-accent/10 text-brand-accent">
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-brand-light">Backend Services</h2>
                          <p className="text-xs text-brand-muted">APIs & runtime status</p>
                        </div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-muted">Architecture:</span>
                          <span className="font-medium text-brand-light">Decoupled Web Tier</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className="text-brand-muted">Telemetry:</span>
                          <span className="text-brand-accent">Integrated</span>
                        </div>
                      </div>

                      <div className="rounded border border-brand-border/60 bg-brand-dark/40 p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-muted">Integrations Hook:</span>
                          <span className="text-brand-muted font-mono">Phase 2 Target</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className="text-brand-muted">State Sync:</span>
                          <span className="text-emerald-400">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Actionable Command Strip */}
          <div className="border-t border-brand-border bg-brand-dark/95 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-accent" />
              <span>Foundation active: React + Vite + TypeScript + Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/akshitonmars/SHAFT"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-accent transition-colors"
              >
                <span>View GitHub Repo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span className="text-brand-border">|</span>
              <span className="font-mono text-brand-light">v0.1.0-alpha</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

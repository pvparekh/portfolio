import { useRef, useState } from 'react';
import { motion, MotionConfig, useInView, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Code2, Copy, Database, FileCheck2, GitBranch, Layers3, Mail, Workflow } from 'lucide-react';
import { caseStudies, type PublicCaseStudy } from './solutionsData';
import { deliveryExamples } from './deliveryExamples';
import { useSolutionsScrollReveal } from './solutionsEffects';
import './solutions.css';
import './solutionsEffects.css';
import './deliveryProof.css';

const email = 'pvparekh14@gmail.com';
const projectEmail = 'mailto:' + email + '?subject=' + encodeURIComponent('Project inquiry | Data engineering') +
  '&body=' + encodeURIComponent('Hi Parth,\n\nI am reaching out about a potential data engineering project.\n\nOur current workflow / problem:\n\nSystems involved:\n\nIdeal timeline:\n\nThanks,\n');

const offerings = [
  {
    number: '01',
    icon: Workflow,
    title: 'Reporting & workflow automation',
    promise: 'Stop rebuilding the same reports by hand.',
    problem: 'Recurring spreadsheets, email attachments, document exports or repetitive back-office tasks should not depend on someone doing the same steps every week.',
    deliverable: 'A scheduled or event-driven workflow that collects, cleans, checks and delivers information where your team needs it.',
    example: 'Automatically process incoming vendor files, reconcile key fields and deliver a finished report.',
    included: 'Workflow mapping, implementation, testing, documentation and a clear handoff.',
    boundary: 'Ongoing support, new platform licenses and unrelated report redesign can be scoped separately.',
    inputs: 'A sample of the current process, example inputs and outputs, access to the relevant tools and the expected schedule.',
    tools: ['Python', 'Excel', 'Power Automate', 'Selenium', 'SFTP', 'Airflow']
  },
  {
    number: '02',
    icon: Database,
    title: 'Data pipelines & integrations',
    promise: 'Connect the systems your business runs on.',
    problem: 'Customer, sales or operational data is scattered across business applications, APIs, files, databases and cloud services.',
    deliverable: 'A repeatable data pipeline or system integration with source mapping, validation, clear failure handling and a defined destination.',
    example: 'Bring orders or CRM exports into a cloud database or analytics warehouse for consistent reporting.',
    included: 'Integration design, ingestion or synchronization, transformation, testing and an operating guide.',
    boundary: 'Organization-wide migrations, complex platform administration and continuous on-call operations require separate scoping.',
    inputs: 'Authorized API or system access, sample records, destination requirements, update frequency and expected data volume.',
    tools: ['REST APIs', 'Python', 'SQL', 'PostgreSQL', 'Snowflake', 'Cloud storage']
  },
  {
    number: '03',
    icon: Code2,
    title: 'SQL & reporting modernization',
    promise: 'Make complicated business logic understandable.',
    problem: 'Important calculations are scattered across reports, fragile queries, nested measures and aging transformations.',
    deliverable: 'Maintainable SQL transformations, documented business rules and reconciliation checks against existing outputs.',
    example: 'Consolidate inconsistent reporting calculations into reusable SQL for a database or warehouse.',
    included: 'Logic discovery, implementation, test cases, representative parity checks and documentation.',
    boundary: 'Broader BI redesigns or undocumented business-rule discovery beyond the agreed dataset can be scoped separately.',
    inputs: 'Current reports or queries, calculation definitions, representative source data and expected results.',
    tools: ['SQL', 'SQL Server', 'Power BI / DAX', 'PostgreSQL', 'Data validation']
  },
  {
    number: '04',
    icon: Layers3,
    title: 'Custom data tools & cloud workflows',
    promise: 'Give your team a better way to work with its data.',
    problem: 'Sometimes the missing piece is not another report. It is a lightweight internal application, processing service or reliable place for a workflow to run.',
    deliverable: 'A focused web tool, API or cloud-hosted job that fits the existing process and includes a documented handoff.',
    example: 'Build an internal upload-and-review tool that validates records, flags exceptions and exports ready-to-use results.',
    included: 'Requirements, interface or API, data processing, deployment plan, validation and operating instructions.',
    boundary: 'Large multi-team platforms, complex security programs and long-term infrastructure operations are estimated independently.',
    inputs: 'Example tasks, users and permissions, existing infrastructure, sample data and the required output.',
    tools: ['React', 'TypeScript', 'FastAPI', 'Python', 'Managed hosting', 'Databases']
  }
];

const process = [
  ['01', 'Discuss', 'Tell me what is manual, broken or missing. We establish whether the project is a fit.'],
  ['02', 'Scope', 'Confirm data access, existing tools, any software costs, deliverables and acceptance checks.'],
  ['03', 'Build', 'Implement in reviewable stages, with clear questions and progress updates.'],
  ['04', 'Validate', 'Reconcile outputs and exercise the cases most likely to fail.'],
  ['05', 'Hand off', 'Deliver source, documentation and operating instructions based on the agreed scope.']
];

function SectionIntro({ index, label, title, accent, description }: { index: string; label: string; title: string; accent?: string; description?: string }) {
  const splitAt = accent ? title.indexOf(accent) : -1;
  return (
    <div className="sol-section-intro">
      <div className="sol-section-index"><span>{index}</span><span className="sol-rule" />{label}</div>
      <h2>{splitAt >= 0 && accent
        ? <>{title.slice(0, splitAt)}<em className="sol-heading-emphasis">{accent}</em>{title.slice(splitAt + accent.length)}</>
        : title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function FlowConnector({ index, active, reducedMotion }: { index: number; active: boolean; reducedMotion: boolean }) {
  return (
    <div className="sol-flow-connector" aria-hidden="true">
      <span className="sol-flow-base" />
      <ArrowRight size={18} />
      <motion.span
        className="sol-flow-trace"
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: active || reducedMotion ? 1 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.25 + index * 0.58, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function ArchitectureGraphic() {
  const graphicRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(graphicRef, { once: true, amount: 0.25 });
  const reducedMotion = !!useReducedMotion();

  return (
    <div ref={graphicRef} className="sol-flow-graphic" aria-label="Diagram: source systems feed a validation and transformation workflow, which delivers dependable data">
      <div className="sol-flow-top"><span>PROJECT PATTERN / 001</span><span>INGEST · VALIDATE · DELIVER</span></div>
      <div className="sol-flow-row">
        <div className="sol-flow-node">
          <span className="sol-flow-icon"><Layers3 size={22} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">01 / INPUT</span>
          <strong>Disconnected sources</strong>
          <small>APIs · files · databases</small>
        </div>
        <FlowConnector index={0} active={isInView} reducedMotion={reducedMotion} />
        <div className="sol-flow-node sol-flow-node-center">
          <span className="sol-flow-icon"><GitBranch size={23} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">02 / SYSTEM</span>
          <strong>Reliable processing</strong>
          <small>Checks · retries · traceability</small>
        </div>
        <FlowConnector index={1} active={isInView} reducedMotion={reducedMotion} />
        <div className="sol-flow-node">
          <span className="sol-flow-icon"><FileCheck2 size={23} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">03 / OUTPUT</span>
          <strong>Useful, trusted data</strong>
          <small>Reports · tables · exports</small>
        </div>
      </div>
      <div className="sol-flow-footer">
        <span className="sol-state">DESIGNED TO BE REPEATABLE</span>
        <span>REAL SYSTEMS</span>
      </div>
    </div>
  );
}

function EngagementProcess() {
  return (
    <div className="sol-process">
      {process.map(([number, name, summary], index) => (
        <div className="sol-process-step" key={number}>
          <span className="sol-process-number">{number}</span>
          {index < process.length - 1 && <ChevronRight className="sol-process-next" size={19} strokeWidth={1.5} aria-hidden="true" />}
          <h3>{name}</h3>
          <p>{summary}</p>
        </div>
      ))}
    </div>
  );
}

function DeliveryProof() {
  return <div className="sol-proof">
    <div className="sol-proof-grid">
      {deliveryExamples.map(item => <article key={item.id} className={`sol-proof-card ${item.featured ? 'sol-proof-featured' : ''}`}>
        <div className="sol-proof-meta"><span>{item.number} / {item.category}</span><span className="sol-proof-delivered"><CheckCircle2 size={14} /> DELIVERED</span></div>
        <div className="sol-proof-card-content">
          <div className="sol-proof-head"><h3>{item.title}</h3><p>{item.lead}</p>
            {item.featured && <div className="sol-proof-steps" aria-label="Data flow from incoming files to usable records"><span>Incoming files</span><ArrowRight size={16} aria-hidden="true" /><span>Clean + validate</span><ArrowRight size={16} aria-hidden="true" /><span>Ready-to-use data</span></div>}
          </div>
          <div className="sol-proof-facts">
            <div><span>THE PROBLEM</span><p>{item.problem}</p></div>
            <div><span>WHAT I BUILT</span><p>{item.delivered}</p></div>
          </div>
        </div>
        <div className="sol-proof-result"><CheckCircle2 size={18} aria-hidden="true" /><div><span>THE RESULT</span><p>{item.result}</p></div></div>
        <div className="sol-proof-tools" aria-label="Technologies involved">{item.tools.map(tool=><span key={tool}>{tool}</span>)}</div>
      </article>)}
    </div>
    <div className="sol-proof-close"><p>Have a version of one of these problems? We can scope the smallest reliable fix around your existing systems.</p><a href="#contact">Discuss a similar project <ArrowUpRight size={16} /></a></div>
  </div>;
}

function CaseStudy({ study, index }: { study: PublicCaseStudy; index: number }) {
  return (
    <article className="sol-case" id={study.id}>
      <div className="sol-case-heading">
        <div className="sol-case-count">{String(index + 1).padStart(2, '0')} <span>/ SELECTED WORK</span></div>
        <div className="sol-case-tag">Independent project</div>
      </div>
      <div className="sol-case-layout">
        <div className="sol-case-lead">
          <p className="sol-eyebrow">{study.eyebrow}</p>
          <h3>{study.title}</h3>
          <p className="sol-case-deck">{study.description}</p>
          <div className="sol-case-links">
            {study.liveUrl && <a href={study.liveUrl} target="_blank" rel="noreferrer">Explore live project <ArrowUpRight size={15} /></a>}
            <a href={study.sourceUrl} target="_blank" rel="noreferrer">{study.id === 'formula-vision' ? 'Documentation' : 'Inspect the code'} <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="sol-case-narrative">
          <div className="sol-case-fact"><span>THE PROBLEM</span><p>{study.problem}</p></div>
          <div className="sol-case-fact"><span>WHAT I BUILT</span><p>{study.work}</p></div>
          <div className="sol-case-fact"><span>WHAT IT ENABLES</span><p>{study.outcome}</p></div>
        </div>
      </div>
      <details className="sol-case-details">
        <summary>Explore the engineering decisions <ChevronRight size={18} /></summary>
        <div className="sol-deep-dive">
          <div>
            <h4>System architecture</h4>
            <ol>{study.architecture.map((part, idx) => <li key={part}><span>{String(idx + 1).padStart(2, '0')}</span>{part}</li>)}</ol>
          </div>
          <div>
            <h4>Reliability and validation</h4>
            <ul>{study.validation.map((point) => <li key={point}><CheckCircle2 size={16} />{point}</li>)}</ul>
            <div className="sol-deep-foot"><span>MY CONTRIBUTION</span><p>{study.contribution}</p></div>
            {study.docsUrl && <a className="sol-text-link" href={study.docsUrl} target="_blank" rel="noreferrer">Read the full engineering overview <ArrowUpRight size={15} /></a>}
          </div>
        </div>
      </details>
      <div className="sol-case-tech">{study.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function SolutionsPage({ onBackToPortfolio }: { onBackToPortfolio: () => void }) {
  const pageRef = useSolutionsScrollReveal();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={pageRef} className="solutions data-solutions">
      <a className="sol-skip" href="#sol-main">Skip to content</a>
      <main id="sol-main">
        <section className="sol-hero" aria-labelledby="sol-hero-title">
          <div className="sol-container sol-hero-layout">
            <div className="sol-hero-copy">
              <div className="sol-topline"><span className="sol-status-dot" /> DATA SOLUTIONS / PARTH PAREKH</div>
              <h1 id="sol-hero-title">From manual data work to <em>reliable systems.</em></h1>
              <p className="sol-hero-sub">As a Data Engineer with a background in Computer Science and Data Science from Rutgers University, I build data pipelines, integrations, and reporting automations that help teams spend less time moving data and more time using it.</p>
              <div className="sol-actions">
                <a className="sol-button sol-button-primary" href="#contact">Discuss a Project <ArrowUpRight size={17} /></a>
                <a className="sol-button sol-button-secondary" href="#work">Explore My Work <ArrowDownRight size={17} /></a>
              </div>
            </div>
            <div className="sol-hero-art"><ArchitectureGraphic /></div>
          </div>
          <div className="sol-hero-bottom sol-container">
            <span>PYTHON / SQL / AIRFLOW / POSTGRESQL / APIs</span>
            <a href="#problems">SCROLL TO EXPLORE <ArrowDownRight size={13} /></a>
          </div>
        </section>

        <section className="sol-problem-section sol-section" id="problems">
          <div className="sol-container">
            <SectionIntro index="01" label="THE PROBLEM" title="Does any of this sound familiar?" accent="familiar?" description="You don't need to know what a DAG or an ETL framework is to recognize work that should run by itself." />
            <div className="sol-problems">
              {[
                ['The weekly spreadsheet ritual', 'Someone downloads files, copies columns, fixes formatting and sends the same report again.'],
                ['Systems that do not talk', 'Useful information is spread across apps, databases and exports with no dependable connection.'],
                ['Reporting nobody wants to touch', 'One change breaks a query, a hidden formula or a process nobody fully understands.']
              ].map(([title, description], i) => (
                <div className="sol-problem" key={title}>
                  <span className="sol-problem-num">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ArrowUpRight aria-hidden="true" size={19} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sol-section sol-services-section" id="services">
          <div className="sol-container">
            <SectionIntro index="02" label="HOW I CAN HELP" title="Focused solutions. Clear deliverables." accent="Clear deliverables." description="The goal is not to sell your team more tooling. It is to finish a defined job, prove the output works and make the result maintainable." />
            <div className="sol-service-list">
              {offerings.map(({ number, icon: Icon, title, promise, problem, deliverable, example, included, boundary, inputs, tools }) => (
                <article className="sol-service" key={number}>
                  <div className="sol-service-identity"><span>{number} / SERVICE</span><Icon size={27} strokeWidth={1.35} /></div>
                  <div className="sol-service-main"><h3>{title}</h3><p className="sol-service-promise">{promise}</p><p>{problem}</p></div>
                  <div className="sol-service-detail">
                    <div><b>THE DELIVERABLE</b><p>{deliverable}</p></div>
                    <div><b>EXAMPLE</b><p>{example}</p></div>
                    <details><summary>Scope and requirements <ChevronRight size={15} /></summary><p><strong>Included:</strong> {included}</p><p><strong>Not included:</strong> {boundary}</p><p><strong>What you provide:</strong> {inputs}</p></details>
                    <div className="sol-service-tech">{tools.map(tool => <span key={tool}>{tool}</span>)}</div>
                    <a className="sol-text-link" href="#contact">Discuss this service <ArrowUpRight size={15} /></a>
                  </div>
                </article>
              ))}
            </div>
            <div className="sol-tooling-note">
              <span className="sol-tooling-symbol"><Layers3 size={21} strokeWidth={1.6} /></span>
              <div><strong>Make the most of the tools you already have.</strong><p>Whether you use spreadsheets, business apps, SQL databases or cloud storage, I start with your existing systems and choose a practical approach. Any new subscriptions, API charges or infrastructure needs are identified when we scope the work.</p></div>
              <a href="#contact" aria-label="Discuss a cost-conscious data project"><ArrowUpRight size={19}/></a>
            </div>
          </div>
        </section>

        <section className="sol-section sol-work-section" id="work">
          <div className="sol-container">
            <SectionIntro index="03" label="SELECTED DELIVERY" title="Engineering work built for real operations" accent="real operations" description="Completed engineering projects in a corporate setting that began with recurring operational problems and ended with working, validated systems." />
            <DeliveryProof />
          </div>
        </section>

        <section className="sol-section sol-approach-section" id="approach">
          <div className="sol-container">
            <SectionIntro index="04" label="WORKING TOGETHER" title="A straightforward path from problem to handoff." accent="from problem to handoff." description="Every project begins with a clear outcome, agreed milestones, practical validation and a handoff your team can use." />
            <EngagementProcess />
            <div className="sol-process-bottom"><span><CheckCircle2 size={17} /> Defined scope before build</span><span><CheckCircle2 size={17} /> Validation before delivery</span><span><CheckCircle2 size={17} /> Documentation at handoff</span></div>
          </div>
        </section>

        <section className="sol-section sol-independent-section" id="independent">
          <div className="sol-container">
            <SectionIntro index="05" label="INDEPENDENT PRODUCTS" title="Products you can explore firsthand" accent="explore firsthand" description="Beyond professional data engineering, I build software products of my own. Explore the live experiences and their public repositories or documentation." />
            <div className="sol-case-list">{caseStudies.filter(study => study.publicationApproved).map((study, index) => <CaseStudy key={study.id} study={study} index={index} />)}</div>
          </div>
        </section>

        <section className="sol-section sol-contact-section" id="contact">
          <div className="sol-container sol-contact-layout">
            <div>
              <p className="sol-eyebrow">06 / LET'S TALK</p>
              <h2>Have a data problem worth <em>solving?</em></h2>
              <p>Send me a short description of what's taking time, what systems are involved and what a successful result would look like. I'll let you know whether it's a fit for a scoped project.</p>
              <div className="sol-contact-email-block">
                <div className="sol-contact-email-topline">DIRECT EMAIL</div>
                <div className="sol-contact-email-row">
                  <span className="sol-contact-email-address">{email}</span>
                  <button type="button" className="sol-contact-copy" onClick={copyEmail} aria-label="Copy email address to clipboard">
                    {copyStatus === 'copied' ? <CheckCircle2 size={17} /> : <Copy size={17} />}
                    {copyStatus === 'copied' ? 'Copied' : 'Copy email'}
                  </button>
                </div>
                <span className="sol-contact-copy-status" role="status" aria-live="polite">
                  {copyStatus === 'copied' ? 'Email address copied. Paste it into Gmail or any email service.' : copyStatus === 'failed' ? 'Copy unavailable. Select the address above to copy it.' : 'Copy the address to use with Gmail, Outlook or any email service.'}
                </span>
                <a className="sol-contact-compose" href={projectEmail}>Prefer your email app? Open a draft <Mail size={14} /></a>
              </div>
            </div>
            <aside className="sol-contact-panel">
              <p className="sol-contact-panel-title">A GOOD FIRST MESSAGE</p>
              <div><span>01</span><p>What your team does manually today</p></div>
              <div><span>02</span><p>The applications, files or databases involved</p></div>
              <div><span>03</span><p>What success looks like and any timing constraints</p></div>
              <p className="sol-contact-small">Copy the address and send a short note from whichever email service you use. Project pricing is quoted based on agreed scope.</p>
            </aside>
          </div>
        </section>
      </main>
      <footer className="sol-footer"><div className="sol-container sol-footer-inner"><a href="/" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onBackToPortfolio(); }}><ArrowLeft size={15} /> Back to portfolio</a><span>Parth Parekh © 2026</span><div className="sol-footer-links"><a href="https://linkedin.com/in/parekh422" target="_blank" rel="noopener noreferrer" aria-label="View Parth Parekh on LinkedIn">LinkedIn <ArrowUpRight size={13}/></a><a href="https://github.com/pvparekh" target="_blank" rel="noopener noreferrer" aria-label="View Parth Parekh on GitHub">GitHub <ArrowUpRight size={13}/></a></div></div></footer>
      </div>
    </MotionConfig>
  );
}

export default SolutionsPage;

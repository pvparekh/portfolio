import { useEffect } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Code2, Database, FileCheck2, GitBranch, Layers3, Mail, ShieldCheck, Workflow } from 'lucide-react';
import { caseStudies, type PublicCaseStudy } from './solutionsData';
import './solutions.css';

const email = 'pvparekh14@gmail.com';
const projectEmail = 'mailto:' + email + '?subject=' + encodeURIComponent('Project inquiry | Data engineering') +
  '&body=' + encodeURIComponent('Hi Parth,\n\nI am reaching out about a potential data engineering project.\n\nOur current workflow / problem:\n\nSystems involved:\n\nIdeal timeline:\n\nThanks,\n');

const offerings = [
  {
    number: '01',
    icon: Workflow,
    title: 'Reporting & workflow automation',
    promise: 'Stop rebuilding the same reports by hand.',
    problem: 'A report only gets delivered when somebody downloads, cleans and assembles files.',
    deliverable: 'A scheduled workflow that collects, cleans, validates and delivers the output your team needs.',
    example: 'Turn recurring spreadsheets and emailed exports into an automated reporting process.',
    included: 'Source review, implementation, validation, documentation and handoff.',
    boundary: 'Does not include ongoing 24/7 monitoring or unlimited report redesign.',
    inputs: 'An example output, sample files, access to relevant systems and the reporting schedule.',
    tools: ['Python', 'Excel', 'SFTP', 'SQL', 'Airflow']
  },
  {
    number: '02',
    icon: Database,
    title: 'Data pipelines & integrations',
    promise: 'Connect the systems your business runs on.',
    problem: 'Useful data lives across APIs, databases and files, with no dependable way to move it.',
    deliverable: 'A documented ingestion or synchronization pipeline with checks, retry behavior and clear ownership.',
    example: 'Move data from an operational system into PostgreSQL for recurring analytics.',
    included: 'Source/target mapping, data transfer, tests, basic failure diagnostics and a runbook.',
    boundary: 'Complex enterprise migrations and continuous on-call support require a separate engagement.',
    inputs: 'Integration requirements, authorized access, destination details and expected data volume.',
    tools: ['APIs', 'Python', 'PostgreSQL', 'Airflow', 'Snowflake']
  },
  {
    number: '03',
    icon: Code2,
    title: 'SQL & reporting modernization',
    promise: 'Make complicated business logic understandable.',
    problem: 'Important calculations are scattered across reports, nested measures and hard-to-maintain queries.',
    deliverable: 'Clean SQL transformations, documented business rules and reconciliation checks against the current results.',
    example: 'Translate reporting calculations into repeatable, testable SQL for downstream systems.',
    included: 'Logic discovery, SQL implementation, representative parity checks and a maintainable explanation.',
    boundary: 'Does not include a blanket guarantee of matching undocumented edge cases without source access.',
    inputs: 'Current reports, calculation definitions, source data, and examples of expected output.',
    tools: ['SQL', 'Power BI / DAX', 'PostgreSQL', 'Data validation']
  }
];

const process = [
  ['01', 'Discuss', 'Tell me what is manual, broken or missing. We establish whether the project is a fit.'],
  ['02', 'Scope', 'Agree on inputs, deliverables, acceptance checks, schedule and fixed boundaries.'],
  ['03', 'Build', 'Implement in reviewable stages, with clear questions and progress updates.'],
  ['04', 'Validate', 'Reconcile outputs and exercise the cases most likely to fail.'],
  ['05', 'Hand off', 'Deliver source, documentation and operating instructions based on the agreed scope.']
];

function SectionIntro({ index, label, title, description }: { index: string; label: string; title: string; description?: string }) {
  return (
    <div className="sol-section-intro">
      <div className="sol-section-index"><span>{index}</span><span className="sol-rule" />{label}</div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function ArchitectureGraphic() {
  return (
    <div className="sol-flow-graphic" aria-label="Diagram: source systems feed a validation and transformation workflow, which delivers dependable data">
      <div className="sol-flow-top"><span>PROJECT PATTERN / 001</span><span>INGEST · VALIDATE · DELIVER</span></div>
      <div className="sol-flow-row">
        <div className="sol-flow-node">
          <span className="sol-flow-icon"><Layers3 size={22} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">01 / INPUT</span>
          <strong>Disconnected sources</strong>
          <small>APIs · files · databases</small>
        </div>
        <div className="sol-flow-connector" aria-hidden="true"><span /><ArrowRight size={18} /><span /></div>
        <div className="sol-flow-node sol-flow-node-center">
          <span className="sol-flow-icon"><GitBranch size={23} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">02 / SYSTEM</span>
          <strong>Reliable processing</strong>
          <small>Checks · retries · traceability</small>
        </div>
        <div className="sol-flow-connector" aria-hidden="true"><span /><ArrowRight size={18} /><span /></div>
        <div className="sol-flow-node">
          <span className="sol-flow-icon"><FileCheck2 size={23} strokeWidth={1.6} /></span>
          <span className="sol-flow-small">03 / OUTPUT</span>
          <strong>Useful, trusted data</strong>
          <small>Reports · tables · exports</small>
        </div>
      </div>
      <div className="sol-flow-footer">
        <span className="sol-state"><span className="sol-status-dot" />DESIGNED TO BE REPEATABLE</span>
        <span>REAL SYSTEMS, NOT ONE-OFF SCRIPTS</span>
      </div>
    </div>
  );
}

function CaseStudy({ study, index }: { study: PublicCaseStudy; index: number }) {
  return (
    <article className="sol-case" id={study.id}>
      <div className="sol-case-heading">
        <div className="sol-case-count">{String(index + 1).padStart(2, '0')} <span>/ INDEPENDENT WORK</span></div>
        <div className="sol-case-tag">{study.classification}</div>
      </div>
      <div className="sol-case-layout">
        <div className="sol-case-lead">
          <p className="sol-eyebrow">{study.eyebrow}</p>
          <h3>{study.title}</h3>
          <p className="sol-case-deck">{study.description}</p>
          <div className="sol-case-links">
            {study.liveUrl && <a href={study.liveUrl} target="_blank" rel="noreferrer">Explore live project <ArrowUpRight size={15} /></a>}
            <a href={study.sourceUrl} target="_blank" rel="noreferrer">Inspect the code <ArrowUpRight size={15} /></a>
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
            <p className="sol-deep-foot"><strong>My contribution:</strong> {study.contribution}</p>
            {study.docsUrl && <a className="sol-text-link" href={study.docsUrl} target="_blank" rel="noreferrer">Read the full engineering overview <ArrowUpRight size={15} /></a>}
          </div>
        </div>
      </details>
      <div className="sol-case-tech">{study.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function SolutionsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Data Engineering Solutions | Parth Parekh';
    const values: Array<[string, string, string]> = [
      ['name', 'description', 'Independent data engineering, reporting automation, SQL modernization and system integrations. Discuss a scoped project with Parth Parekh.'],
      ['property', 'og:title', 'Data Engineering Solutions | Parth Parekh'],
      ['property', 'og:description', 'Manual reporting, disconnected systems and fragile pipelines. I build focused, reliable solutions.'],
      ['property', 'og:url', 'https://parthparekh.dev/solutions']
    ];
    const created: HTMLMetaElement[] = [];
    for (const [selector, key, value] of values) {
      let el = document.querySelector<HTMLMetaElement>('meta[' + selector + '="' + key + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(selector, key); document.head.appendChild(el); created.push(el); }
      el.content = value;
    }
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    let madeCanonical = false;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); madeCanonical = true; }
    canonical.href = 'https://parthparekh.dev/solutions';
    return () => { document.title = previousTitle; created.forEach((el) => el.remove()); if (madeCanonical) canonical?.remove(); };
  }, []);

  return (
    <div className="solutions">
      <a className="sol-skip" href="#sol-main">Skip to content</a>
      <header className="sol-header">
        <div className="sol-header-inner">
          <a className="sol-wordmark" href="/" aria-label="Parth Parekh, back to portfolio">PARTH<span>.</span><small> / SOLUTIONS</small></a>
          <nav className="sol-nav" aria-label="Solutions page">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#approach">Approach</a>
          </nav>
          <a className="sol-nav-cta" href="#contact">Discuss a Project <ArrowUpRight size={15} /></a>
        </div>
      </header>

      <main id="sol-main">
        <section className="sol-hero" aria-labelledby="sol-hero-title">
          <div className="sol-container sol-hero-layout">
            <div className="sol-hero-copy">
              <div className="sol-topline"><span className="sol-status-dot" /> INDEPENDENT ENGINEERING / FOCUSED PROJECTS</div>
              <h1 id="sol-hero-title">From manual data work to <em>reliable systems.</em></h1>
              <p className="sol-hero-sub">I build data pipelines, integrations and reporting automations that help teams spend less time moving data and more time using it.</p>
              <div className="sol-actions">
                <a className="sol-button sol-button-primary" href="#contact">Discuss a Project <ArrowUpRight size={17} /></a>
                <a className="sol-button sol-button-secondary" href="#work">Explore My Work <ArrowDownRight size={17} /></a>
              </div>
              <p className="sol-hero-signature">Parth Parekh <span>/</span> Data engineer · Rutgers CS graduate</p>
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
            <SectionIntro index="01" label="THE PROBLEM" title="Does any of this sound familiar?" description="You don't need to know what a DAG or an ETL framework is to recognize work that should run by itself." />
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
            <SectionIntro index="02" label="HOW I CAN HELP" title="Focused solutions. Clear deliverables." description="The goal is not to sell your team more tooling. It is to finish a defined job, prove the output works and make the result maintainable." />
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
          </div>
        </section>

        <section className="sol-section sol-work-section" id="work">
          <div className="sol-container">
            <SectionIntro index="03" label="ENGINEERING EVIDENCE" title="See the systems behind the claims." description="These are independent, inspectable projects, not invented consulting engagements or examples borrowed from an employer." />
            <div className="sol-case-list">{caseStudies.filter(study => study.publicationApproved).map((study, index) => <CaseStudy key={study.id} study={study} index={index} />)}</div>
            <div className="sol-practice-note">
              <ShieldCheck size={24} strokeWidth={1.5} />
              <div><h3>Professional context, without proprietary material.</h3><p>I also work as a Junior Data Engineer, building and validating production data workflows. Client data, internal code and employer-specific systems are not published here. Public projects above provide independently reviewable technical evidence.</p></div>
            </div>
          </div>
        </section>

        <section className="sol-section sol-approach-section" id="approach">
          <div className="sol-container">
            <SectionIntro index="04" label="WORKING TOGETHER" title="A straightforward path from problem to handoff." description="I take on clearly bounded, independently deliverable work. Projects are scheduled around existing full-time commitments, with milestones and availability agreed before work begins." />
            <div className="sol-process">{process.map(([number, name, summary]) => <div className="sol-process-step" key={number}><span>{number}</span><h3>{name}</h3><p>{summary}</p></div>)}</div>
            <div className="sol-process-bottom"><span><CheckCircle2 size={17} /> Defined scope before build</span><span><CheckCircle2 size={17} /> Validation before delivery</span><span><CheckCircle2 size={17} /> Documentation at handoff</span></div>
          </div>
        </section>

        <section className="sol-section sol-contact-section" id="contact">
          <div className="sol-container sol-contact-layout">
            <div>
              <p className="sol-eyebrow">05 / LET'S TALK</p>
              <h2>Have a data problem worth <em>solving?</em></h2>
              <p>Send me a short description of what's taking time, what systems are involved and what a successful result would look like. I'll let you know whether it's a fit for a scoped project.</p>
              <a className="sol-button sol-button-primary sol-contact-button" href={projectEmail}>Discuss a Project <Mail size={17} /></a>
              <a className="sol-direct-email" href={'mailto:' + email}>{email} <ArrowUpRight size={15} /></a>
            </div>
            <aside className="sol-contact-panel">
              <p className="sol-contact-panel-title"><span className="sol-status-dot" /> A GOOD FIRST MESSAGE</p>
              <div><span>01</span><p>What your team does manually today</p></div>
              <div><span>02</span><p>The applications, files or databases involved</p></div>
              <div><span>03</span><p>What success looks like and any timing constraints</p></div>
              <p className="sol-contact-small">The button opens your email application with a short project outline. No account or form required. Initial project pricing is quoted based on agreed scope.</p>
            </aside>
          </div>
        </section>
      </main>
      <footer className="sol-footer"><div className="sol-container sol-footer-inner"><a href="/"><ArrowLeft size={15} /> Back to portfolio</a><span>Parth Parekh © 2026</span><a href="https://github.com/pvparekh" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a></div></footer>
    </div>
  );
}

export default SolutionsPage;

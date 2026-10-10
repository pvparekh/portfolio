import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, Code2, Copy, Globe2, Layers3, Mail, PlugZap, PanelsTopLeft, Sparkles, Wrench } from 'lucide-react';
import { softwareProjects, type SoftwareProject } from './softwareProjects';
import './solutions.css';
import './software.css';

const email = 'pvparekh14@gmail.com';
const projectEmail = 'mailto:' + email + '?subject=' + encodeURIComponent('Software project inquiry | Parth Parekh') +
  '&body=' + encodeURIComponent('Hi Parth,\n\nI would like to build or improve:\n\nWho will use it:\n\nThe most important features or outcome:\n\nExisting website or systems (if any):\n\nApproximate timeline (if known):\n\nThanks,\n');

const offerings = [
  {number:'01',icon:PanelsTopLeft,title:'Custom web applications & internal tools',
   promise:'Purpose-built software for people who need to get something done.',
   problem:'A customer portal, admin screen, lightweight dashboard or staff tool can be more useful than trying to force another product to fit.',
   deliverable:'A working web application with defined screens, workflows and appropriate access controls.',
   example:'A private team tool to review submissions, update their status and export results.',
   included:'Requirements, interface implementation, agreed backend features, testing, deployment guidance and handoff.',
   boundary:'Extensive permission systems, regulated-data handling, enterprise integrations and indefinite operations are separately scoped.',
   inputs:'Intended users, must-have workflows, sample information, access requirements and a decision maker.',
   tools:['React','TypeScript','Next.js','PostgreSQL'],proof:{id:'aetherflow',label:'AetherFlow'}},
  {number:'02',icon:Globe2,title:'Business websites & booking experiences',
   promise:'Make it easier for customers to understand and reach your business.',
   problem:'Your business needs a modern responsive site, clearer services or a smoother way for visitors to take action.',
   deliverable:'A polished customer-facing website with agreed pages, content layout and useful integrations.',
   example:'A local service website with service pages, mobile navigation and appointment booking.',
   included:'Page structure, responsive development, agreed forms or booking integration, basic testing and launch handoff.',
   boundary:'Paid marketing, content production, ongoing SEO programs and third-party subscription fees are separate.',
   inputs:'Brand assets, service information, example sites, content approvals and access to the domain or booking provider.',
   tools:['Next.js','TypeScript','Responsive UI','Calendly'],proof:{id:'salon',label:'Perfect Threading Salon'}},
  {number:'03',icon:PlugZap,title:'Backend services & integrations',
   promise:'Connect application features to the systems behind them.',
   problem:'Your product needs a focused API, webhook, server-side workflow or third-party connection.',
   deliverable:'A defined backend service or integration with clear inputs, outputs and error handling.',
   example:'Receive an application event, validate it, process a request and update an external service.',
   included:'Integration design, API or event implementation, relevant testing, configuration notes and handoff.',
   boundary:'Unlimited vendor integrations, vendor pricing, infrastructure support and major security audits are separately estimated.',
   inputs:'API access or documentation, event examples, expected behavior and the systems you control.',
   tools:['Python','FastAPI','REST APIs','Webhooks'],proof:{id:'review-bot',label:'GitHub Review Bot'}},
  {number:'04',icon:Sparkles,title:'AI-assisted software features',
   promise:'Add useful model-assisted behavior inside a real application.',
   problem:'A defined task such as classifying documents, preparing suggestions or reviewing content may benefit from AI with human oversight.',
   deliverable:'A scoped AI-backed feature connected to an existing or new application, with reviewable outputs.',
   example:'Categorize uploaded files and present suggested results for a person to confirm.',
   included:'Task definition, integration, structured responses, practical fallbacks, testing with examples and cost considerations.',
   boundary:'Guaranteed model accuracy, autonomous high-stakes decisions, model training and open-ended AI research are excluded.',
   inputs:'Representative examples, criteria for good outputs, acceptable error cases and API billing access.',
   tools:['OpenAI API','Claude','TypeScript','Python'],proof:{id:'aetherflow',label:'AetherFlow'}},
  {number:'05',icon:Wrench,title:'Existing application improvements',
   promise:'Make a useful product easier to use, extend or maintain.',
   problem:'An existing web app needs a defined feature, a cleaner interaction or a specific frontend/backend improvement.',
   deliverable:'An agreed enhancement to an existing codebase with verification against current behavior.',
   example:'Add a filterable view, improve mobile usability or connect an existing interface to an API.',
   included:'Codebase review, change scope, implementation, regression checks and documentation of what changed.',
   boundary:'Full rewrites, undocumented systems, broad platform migrations and ongoing maintenance are assessed separately.',
   inputs:'Repository access, current behavior, expected outcome, test environment and release owner.',
   tools:['React','TypeScript','APIs','Testing'],proof:{id:'formula',label:'Formula Vision'}}
];
const process = [
 ['01','Understand','We discuss who will use the software, what it should enable and what already exists.'],
 ['02','Scope','We agree on features, responsibilities, dependencies, acceptance checks and an estimate.'],
 ['03','Build','I implement the agreed features in reviewable milestones and share meaningful progress.'],
 ['04','Validate','We test core flows, important edge cases, device layouts and the agreed acceptance criteria.'],
 ['05','Hand off','We agree on launch or source delivery, access, operating notes and any separately scoped support.']
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

function SoftwarePreview() {
  return (
    <div className="software-workspace" role="img" aria-label="Illustrative custom application interface with a navigation rail, a project workspace, and software features designed around the user's workflow. This is a design concept, not a client application screenshot.">
      <div className="software-workspace-top">
        <span><span className="software-preview-spark" /> MADE FOR YOUR WORK</span>
        <span>UI STUDY / 01</span>
      </div>

      <div className="software-workspace-browser">
        <div className="software-browser-bar">
          <div className="software-window-dots" aria-hidden="true"><span /><span /><span /></div>
          <span className="software-browser-location"><Globe2 size={11} strokeWidth={1.8} /> workspace / overview</span>
          <span className="software-browser-badge">UI CONCEPT</span>
        </div>

        <div className="software-interface">
          <div className="software-interface-sidebar" aria-hidden="true">
            <span className="software-sidebar-mark"><Layers3 size={17} strokeWidth={1.8} /></span>
            <span className="software-sidebar-item software-sidebar-item-active"><PanelsTopLeft size={16} strokeWidth={1.8} /></span>
            <span className="software-sidebar-item"><Wrench size={16} strokeWidth={1.8} /></span>
            <span className="software-sidebar-item"><PlugZap size={16} strokeWidth={1.8} /></span>
            <span className="software-sidebar-avatar"><span /></span>
          </div>

          <div className="software-interface-content">
            <div className="software-interface-overline">
              <span>THE WORKSPACE</span>
              <span className="software-app-signal"><span /> PURPOSE-BUILT</span>
            </div>
            <div className="software-interface-headline">
              <div>
                <h3>Built around <em>your workflow.</em></h3>
                <p>Your team's work in one place.</p>
              </div>
              <div className="software-product-emblem" aria-hidden="true">
                <span className="software-product-emblem-glow" />
                <PanelsTopLeft size={26} strokeWidth={1.35} />
              </div>
            </div>

            <div className="software-dashboard">
              <div className="software-workflow-panel">
                <div className="software-panel-heading"><span>DESIGNED FOR WHAT MATTERS</span><span>03</span></div>
                <div className="software-task">
                  <span className="software-task-icon"><PanelsTopLeft size={15} strokeWidth={1.65} /></span>
                  <span className="software-task-label"><strong>Thoughtful interfaces</strong><small>Clear, comfortable to use</small></span>
                  <CheckCircle2 className="software-task-check" size={14} strokeWidth={1.5} />
                </div>
                <div className="software-task">
                  <span className="software-task-icon"><PlugZap size={15} strokeWidth={1.65} /></span>
                  <span className="software-task-label"><strong>Connected workflows</strong><small>The right tools together</small></span>
                  <CheckCircle2 className="software-task-check" size={14} strokeWidth={1.5} />
                </div>
                <div className="software-task">
                  <span className="software-task-icon"><CheckCircle2 size={15} strokeWidth={1.65} /></span>
                  <span className="software-task-label"><strong>Practical delivery</strong><small>Ready for the real world</small></span>
                  <CheckCircle2 className="software-task-check" size={14} strokeWidth={1.5} />
                </div>
              </div>
              <div className="software-details-panel">
                <div className="software-details-head"><span>YOUR PRODUCT</span><Sparkles size={14} strokeWidth={1.5} /></div>
                <div className="software-details-illustration">
                  <div className="software-details-ring software-details-ring-one" />
                  <div className="software-details-ring software-details-ring-two" />
                  <div className="software-details-center"><Code2 size={22} strokeWidth={1.6} /></div>
                  <span className="software-orbit-dot software-orbit-dot-one" />
                  <span className="software-orbit-dot software-orbit-dot-two" />
                </div>
                <strong>Designed for you</strong>
                <span className="software-details-caption">NOT ANOTHER TEMPLATE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="software-workspace-footer">
        <span><span className="software-preview-pulse" /> INTUITIVE BY DESIGN</span>
        <span>BUILT FOR REAL USE</span>
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



function CaseStudy({ study, index }: { study: SoftwareProject; index: number }) {
  return (
    <article className="sol-case" id={study.id}>
      <div className="sol-case-heading">
        <div className="sol-case-count">{String(index + 1).padStart(2, '0')} <span>/ SELECTED WORK</span></div>
        <div className="sol-case-tag">{study.classification}</div>
      </div>
      <div className="sol-case-layout">
        <div className="sol-case-lead">
          <p className="sol-eyebrow">{study.eyebrow}</p>
          <h3>{study.title}</h3>
          <p className="sol-case-deck">{study.description}</p>
          <div className="sol-case-links">
            {study.liveUrl && <a href={study.liveUrl} target="_blank" rel="noreferrer">Explore live project <ArrowUpRight size={15} /></a>}
            <a href={study.sourceUrl} target="_blank" rel="noreferrer">{study.sourceLabel} <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="sol-case-narrative">
          <div className="sol-case-fact"><span>THE NEED</span><p>{study.problem}</p></div>
          <div className="sol-case-fact"><span>WHAT I BUILT</span><p>{study.work}</p></div>
          <div className="sol-case-fact"><span>THE RESULT</span><p>{study.outcome}</p></div>
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

function SoftwarePage({ onBackToPortfolio }: { onBackToPortfolio: () => void }) {
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
      <div className="solutions software-solutions">
      <a className="sol-skip" href="#sol-main">Skip to content</a>
      <main id="sol-main">
        <section className="sol-hero" aria-labelledby="sol-hero-title">
          <div className="sol-container sol-hero-layout">
            <div className="sol-hero-copy">
              <div className="sol-topline"><span className="sol-status-dot" /> SOFTWARE SOLUTIONS / PARTH PAREKH</div>
              <h1 id="sol-hero-title">Custom software <em>for your business.</em></h1>
              <p className="sol-hero-sub">I design and develop business websites, web applications and focused software tools, from the first requirements to a working handoff. Explore real projects, then tell me what you need to build or improve.</p>
              <div className="sol-actions">
                <a className="sol-button sol-button-primary" href="#contact">Discuss a Project <ArrowUpRight size={17} /></a>
                <a className="sol-button sol-button-secondary" href="#work">Explore My Work <ArrowDownRight size={17} /></a>
              </div>
            </div>
            <div className="sol-hero-art"><SoftwarePreview /></div>
          </div>
          <div className="sol-hero-bottom sol-container">
            <span>WEB APPS / BUSINESS WEBSITES / BACKENDS / INTEGRATIONS</span>
            <a href="#opportunities">SCROLL TO EXPLORE <ArrowDownRight size={13} /></a>
          </div>
        </section>

        <section className="sol-problem-section sol-section" id="opportunities">
          <div className="sol-container">
            <SectionIntro index="01" label="THE OPPORTUNITY" title="When off-the-shelf isn't quite right." accent="isn't quite right." description="Sometimes you need to launch something new. Sometimes the missing piece is one useful feature or a clearer customer experience." />
            <div className="sol-problems">
              {[
                ['An idea needs a working product', 'You have a specific concept for customers or employees, but need someone to turn it into usable software.'],
                ['Your business needs a better front door', 'Customers should be able to explore services, book or take the next step without extra friction.'],
                ['Your current tools have a gap', 'The application you use almost works, but an integration, interface or focused feature would make it fit.']
              ].map(([title, description], i) => (
                <div className="sol-problem" key={title}>
                  <span className="sol-problem-num">0{i + 1}</span><h3>{title}</h3><p>{description}</p>
                  <ArrowUpRight aria-hidden="true" size={19} />
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="sol-section sol-services-section" id="services">
          <div className="sol-container">
            <SectionIntro index="02" label="HOW I CAN HELP" title="What I can build for you" accent="build for you" description="A useful project starts with what people need to do, not a list of programming languages. Each engagement is sized around a defined outcome." />
            <div className="sol-service-list">
              {offerings.map(({ number, icon: Icon, title, promise, problem, deliverable, example, included, boundary, inputs, tools, proof }) => (
                <article className="sol-service" key={number}>
                  <div className="sol-service-identity"><span>{number} / SERVICE</span><Icon size={27} strokeWidth={1.35} /></div>
                  <div className="sol-service-main"><h3>{title}</h3><p className="sol-service-promise">{promise}</p><p>{problem}</p></div>
                  <div className="sol-service-detail">
                    <div><b>THE DELIVERABLE</b><p>{deliverable}</p></div>
                    <div><b>EXAMPLE</b><p>{example}</p></div>
                    <details><summary>Scope and requirements <ChevronRight size={15} /></summary><p><strong>Included:</strong> {included}</p><p><strong>Not included:</strong> {boundary}</p><p><strong>What you provide:</strong> {inputs}</p></details>
                    <div className="sol-service-tech">{tools.map(tool => <span key={tool}>{tool}</span>)}</div>
                    <div className="software-service-links"><a className="sol-text-link" href="#contact">Discuss this service <ArrowUpRight size={15} /></a><a className="software-service-proof" href={"#" + proof.id}>Related work: {proof.label} <ArrowUpRight size={14} /></a></div>
                  </div>
                </article>
              ))}
            </div>
            <div className="sol-tooling-note">
              <span className="sol-tooling-symbol"><Layers3 size={21} strokeWidth={1.6} /></span>
              <div><strong>Designed for the scope you actually need.</strong><p>Start with the essential features and the systems you already use. Hosting, third-party subscriptions and any API charges are discussed before the build, not buried in the handoff.</p></div>
              <a href="#contact" aria-label="Discuss a scoped software project"><ArrowUpRight size={19}/></a>
            </div>
          </div>
        </section>

        <section className="sol-section sol-independent-section software-work-section" id="work">
          <div className="sol-container">
            <SectionIntro index="03" label="SELECTED SOFTWARE" title="Software I have designed and built" accent="designed and built" description="Client delivery, independent products and academic work are identified separately. Explore what each application does, what I built and the engineering behind it." />
            <div className="sol-case-list">{softwareProjects.map((study, index) => <CaseStudy key={study.id} study={study} index={index} />)}</div>
          </div>
        </section>


        <section className="sol-section sol-approach-section" id="approach">
          <div className="sol-container">
            <SectionIntro index="04" label="WORKING TOGETHER" title="How we would work together" accent="work together" description="A proportionate process, with defined requirements, meaningful checkpoints and clear ownership at launch." />
            <EngagementProcess />
            <div className="sol-process-bottom"><span><CheckCircle2 size={17} /> Agreed features before build</span><span><CheckCircle2 size={17} /> Validation before delivery</span><span><CheckCircle2 size={17} /> Documentation at handoff</span></div>
          </div>
        </section>


        <section className="sol-section sol-contact-section" id="contact">
          <div className="sol-container sol-contact-layout">
            <div>
              <p className="sol-eyebrow">05 / LET'S TALK</p>
              <h2>Have software in mind? <em>Let's talk.</em></h2>
              <p>Tell me what you want to build, who it's for and the one or two things it most needs to do. An early idea is enough to start a conversation about a practical scope.</p>
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
              <div><span>01</span><p>What you'd like to build or improve</p></div>
              <div><span>02</span><p>Who will use it and what matters most</p></div>
              <div><span>03</span><p>Existing tools and approximate timing, if known</p></div>
              <p className="sol-contact-small">Copy the address and send a short note from whichever email service you use. Project pricing and optional ongoing support are scoped separately.</p>
            </aside>
          </div>
        </section>
      </main>
      <footer className="sol-footer"><div className="sol-container sol-footer-inner"><a href="/" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onBackToPortfolio(); }}><ArrowLeft size={15} /> Back to portfolio</a><span>Parth Parekh © 2026</span><div className="sol-footer-links"><a href="https://linkedin.com/in/parekh422" target="_blank" rel="noopener noreferrer" aria-label="View Parth Parekh on LinkedIn">LinkedIn <ArrowUpRight size={13}/></a><a href="https://github.com/pvparekh" target="_blank" rel="noopener noreferrer" aria-label="View Parth Parekh on GitHub">GitHub <ArrowUpRight size={13}/></a></div></div></footer>
      </div>
    </MotionConfig>
  );
}

export default SoftwarePage;

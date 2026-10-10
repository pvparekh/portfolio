import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

export type SitePage = 'portfolio' | 'solutions';

const portfolioSections = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
];

const solutionSections = [
  { label: 'Services', id: 'services' },
  { label: 'Work', id: 'work' },
  { label: 'Approach', id: 'approach' },
];

type SiteNavProps = {
  page: SitePage;
  navigate: (page: SitePage) => void;
  goToSection: (page: SitePage, id: string) => void;
};

type NavigationGroup = {
  label: string;
  page: SitePage;
  items: typeof portfolioSections;
};

const groups: NavigationGroup[] = [
  { label: 'Portfolio', page: 'portfolio', items: portfolioSections },
  { label: 'Data Solutions', page: 'solutions', items: solutionSections },
];

/** One persistent header, shared across both routes. */
export default function SiteNav({ page, navigate, goToSection }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  // A mouse click into Solutions keeps its link under the pointer until exit.
  // Direct visits, keyboard activation, and touch navigation need no hover gate.
  const [solutionsDropdownReady, setSolutionsDropdownReady] = useState(page === 'solutions');
  const solutionsLinkMouseDown = useRef(false);
  const solutionsLinkRef = useRef<HTMLAnchorElement>(null);
  const suppressSolutionsHover = useRef(false);
  const solutionsDropdownDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelSolutionsDropdownDelay = () => {
    if (solutionsDropdownDelay.current !== null) {
      clearTimeout(solutionsDropdownDelay.current);
      solutionsDropdownDelay.current = null;
    }
  };

  const scheduleSolutionsDropdown = () => {
    cancelSolutionsDropdownDelay();
    solutionsDropdownDelay.current = setTimeout(() => {
      solutionsDropdownDelay.current = null;
      // Do not replace a link that the pointer has moved back onto.
      if (!solutionsLinkRef.current?.matches(':hover')) {
        // A newly mounted dropdown can have a slightly larger hitbox.
        // Suppress its initial hover-open until the pointer leaves that hitbox.
        suppressSolutionsHover.current = true;
        setSolutionsDropdownReady(true);
      }
    }, 500);
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopGroup, setDesktopGroup] = useState<SitePage | null>(null);
  const [mobileGroup, setMobileGroup] = useState<SitePage | null>(null);
  const desktopAreaRef = useRef<HTMLDivElement>(null);
  const desktopTriggers = useRef<Record<SitePage, HTMLButtonElement | null>>({ portfolio: null, solutions: null });
  const reducedMotion = !!useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDesktopGroup(null);
    setMobileOpen(false);
    setMobileGroup(null);
  }, [page]);

  useEffect(() => {
    if (!solutionsDropdownReady) {
      setDesktopGroup(current => current === 'solutions' ? null : current);
    }
  }, [solutionsDropdownReady]);

  useEffect(() => {
    // If the cursor leaves during the route transition, use the same half-second
    // delay rather than swapping the label immediately beneath the pointer.
    if (page === 'solutions' && !solutionsDropdownReady &&
        !solutionsLinkRef.current?.matches(':hover')) {
      scheduleSolutionsDropdown();
    }
    return cancelSolutionsDropdownDelay;
  }, [page, solutionsDropdownReady]);

  useEffect(() => {
    const onOutsidePointer = (event: PointerEvent) => {
      if (desktopAreaRef.current && !desktopAreaRef.current.contains(event.target as Node)) {
        setDesktopGroup(null);
      }
    };
    document.addEventListener('pointerdown', onOutsidePointer);
    return () => document.removeEventListener('pointerdown', onOutsidePointer);
  }, []);

  const goto = (targetPage: SitePage, id: string, event: MouseEvent<HTMLAnchorElement>) => {
    // Native links remain usable when opening a new tab or copying the address.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setDesktopGroup(null);
    setMobileGroup(null);
    setMobileOpen(false);
    goToSection(targetPage, id);
  };

  const destination = (targetPage: SitePage, id: string) =>
    (targetPage === 'portfolio' ? '/' : '/solutions') + '#' + id;

  const reveal = (targetPage: SitePage) => setDesktopGroup(targetPage);

  const followGroup = (targetPage: SitePage, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setDesktopGroup(null);
    setMobileOpen(false);
    setMobileGroup(null);
    navigate(targetPage);
  };
  const dropdown = (group: NavigationGroup) => {
    const open = desktopGroup === group.page;
    return (
      <div
        key={group.page}
        className="portfolio-nav-dropdown"
        onPointerEnter={event => {
          if (event.pointerType !== 'mouse') return;
          if (group.page === 'solutions' && suppressSolutionsHover.current) return;
          reveal(group.page);
        }}
        onPointerLeave={event => {
          // Focus may remain on a previously clicked link; it should not pin
          // the dropdown open after the mouse leaves the entire group.
          if (event.pointerType === 'mouse') {
            if (group.page === 'solutions') suppressSolutionsHover.current = false;
            setDesktopGroup(current => current === group.page ? null : current);
          }
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDesktopGroup(null);
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setDesktopGroup(null);
            desktopTriggers.current[group.page]?.focus();
          }
        }}
      >
        <a
          href={group.page === 'portfolio' ? '/' : '/solutions'}
          onClick={event => followGroup(group.page, event)}
          className="nav-link portfolio-nav-destination font-mono text-xs tracking-widest uppercase"
          style={{ color: 'var(--text-2)' }}
        >{group.label}</a>
        <button
          type="button"
          ref={node => { desktopTriggers.current[group.page] = node; }}
          className="portfolio-nav-trigger portfolio-nav-chevron-button"
          aria-label={'Show ' + group.label + ' sections'}
          aria-expanded={open}
          aria-controls={open ? 'site-dropdown-' + group.page : undefined}
          onClick={() => setDesktopGroup(open ? null : group.page)}
        >
          <ChevronDown size={14} className={open ? 'portfolio-chevron is-open' : 'portfolio-chevron'} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={'site-dropdown-' + group.page}
              className="portfolio-dropdown-position"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -7, scale: 0.985 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: 0.985 }}
              transition={{ duration: reducedMotion ? 0 : 0.16, ease: 'easeOut' }}
            >
              <div className="portfolio-dropdown-panel" aria-label={group.label + ' sections'}>
                <p className="portfolio-dropdown-kicker">{group.label.toUpperCase()} / SECTIONS</p>
                {group.items.map((item, index) => (
                  <a
                    key={item.id}
                    href={destination(group.page, item.id)}
                    onClick={event => goto(group.page, item.id, event)}
                    className="portfolio-dropdown-link"
                  >
                    <span className="portfolio-dropdown-index">0{index + 1}</span>
                    <span>{item.label}</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const mobileDisclosure = (group: NavigationGroup) => {
    const open = mobileGroup === group.page;
    return (
      <div className="portfolio-mobile-group" key={group.page}>
        <div className="portfolio-mobile-disclosure-row">
          <a
            href={group.page === 'portfolio' ? '/' : '/solutions'}
            className="portfolio-mobile-destination font-mono text-xs tracking-widest uppercase"
            onClick={event => followGroup(group.page, event)}
          >{group.label}</a>
          <button
            type="button"
            className="portfolio-mobile-trigger"
            aria-label={'Show ' + group.label + ' sections'}
            aria-expanded={open}
            aria-controls={open ? 'site-mobile-' + group.page : undefined}
            onClick={() => setMobileGroup(open ? null : group.page)}
          >
            <ChevronDown size={15} className={open ? 'portfolio-chevron is-open' : 'portfolio-chevron'} aria-hidden="true" />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={'site-mobile-' + group.page}
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="portfolio-mobile-sections"
            >
              {group.items.map(item => (
                <a
                  key={item.id}
                  href={destination(group.page, item.id)}
                  onClick={event => goto(group.page, item.id, event)}
                  className="portfolio-mobile-link font-mono text-xs tracking-widest uppercase"
                >
                  {item.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.nav
      initial={reducedMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="site-shared-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      aria-label="Main navigation"
      style={{
        background: scrolled ? 'rgba(8,8,13,0.96)' : 'rgba(8,8,13,0.87)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid rgba(255,255,255,.055)',
      }}
    >
      <div className="w-full px-6 md:px-10 h-16 flex items-center justify-between">
        <a
          href="/"
          onClick={event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            navigate('portfolio');
          }}
          className="site-shared-brand"
          aria-label={page === 'solutions' ? 'Parth Parekh, back to portfolio' : 'Parth Parekh, back to top'}
        >
          PARTH<span className="site-shared-brand-period">.</span>
          {page === 'solutions' && <small className="site-shared-brand-section"> / DATA SOLUTIONS</small>}
        </a>

        <div className="portfolio-desktop-nav hidden md:flex items-center gap-7 lg:gap-9" ref={desktopAreaRef}>
          {dropdown(groups[0])}
          {page === 'solutions' && solutionsDropdownReady ? dropdown(groups[1]) : (
            <a
              ref={solutionsLinkRef}
              href="/solutions"
              className="nav-link font-mono text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-2)' }}
              onPointerDown={event => { solutionsLinkMouseDown.current = event.pointerType === 'mouse'; }}
              onPointerEnter={event => {
                if (event.pointerType === 'mouse') cancelSolutionsDropdownDelay();
              }}
              onPointerLeave={event => {
                if (event.pointerType !== 'mouse') return;
                if (page === 'solutions') scheduleSolutionsDropdown();
                else solutionsLinkMouseDown.current = false;
              }}
              onClick={event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                // The route changes while the cursor remains over this same link.
                // Arm the disclosure as soon as that mouse pointer leaves it.
                if (page !== 'solutions') setSolutionsDropdownReady(!solutionsLinkMouseDown.current);
                solutionsLinkMouseDown.current = false;
                navigate('solutions');
              }}
            >
              Data Solutions
            </a>
          )}
          {page === 'solutions' ? (
            <a href="#contact" onClick={event => goto('solutions', 'contact', event)}
              className="btn-primary font-mono text-xs tracking-widest px-4 py-2 rounded-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#08080D' }}>Connect</a>
          ) : (
            <a href="mailto:pvparekh14@gmail.com"
              className="btn-primary font-mono text-xs tracking-widest px-4 py-2 rounded-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#08080D' }}>Connect</a>
          )}
        </div>

        <button
          type="button"
          className="portfolio-menu-toggle md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => { setMobileOpen(!mobileOpen); if (mobileOpen) setMobileGroup(null); }}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls={mobileOpen ? 'site-mobile-navigation' : undefined}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: 'var(--text-2)',
                transform: i === 0 && mobileOpen ? 'rotate(45deg) translate(3.5px, 3.5px)'
                  : i === 2 && mobileOpen ? 'rotate(-45deg) translate(3.5px, -3.5px)' : '',
                opacity: i === 1 && mobileOpen ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id="site-mobile-navigation"
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="portfolio-mobile-panel md:hidden overflow-hidden"
            style={{ background: 'rgba(8,8,13,0.98)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {mobileDisclosure(groups[0])}
              {page === 'solutions' ? mobileDisclosure(groups[1]) : (
                <a
                  href="/solutions"
                  className="portfolio-mobile-solutions font-mono text-xs tracking-widest uppercase"
                  style={{ color: 'var(--accent)' }}
                  onClick={event => {
                    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    setMobileOpen(false);
                    navigate('solutions');
                  }}
                >
                  Data Solutions <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
              {page === 'solutions' && (
                <a className="portfolio-mobile-solutions font-mono text-xs tracking-widest uppercase"
                  href="#contact" onClick={event => goto('solutions', 'contact', event)}
                  style={{ color: 'var(--accent)' }}>Connect <ArrowUpRight size={14} aria-hidden="true" /></a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.span className="site-reading-progress" aria-hidden="true" style={{ scaleX: scrollYProgress }} />
    </motion.nav>
  );
}

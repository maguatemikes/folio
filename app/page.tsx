import { awards, marquee, site, statement, stats } from "@/lib/data";
import { surnamePaths, surnameViewBox } from "@/lib/surname-paths";
import BackToTop from "@/components/BackToTop";
import Clock from "@/components/Clock";
import Effects from "@/components/Effects";
import FluidPanel from "@/components/FluidPanel";
import HorizontalWork from "@/components/HorizontalWork";
import Loader from "@/components/Loader";
import MarqueeIcon from "@/components/MarqueeIcon";
import Nav from "@/components/Nav";
import RollLink from "@/components/RollLink";
import ScrollProgress from "@/components/ScrollProgress";
import Services from "@/components/Services";
import Systems from "@/components/Systems";
import ShaderImage from "@/components/ShaderImage";
import SmokeyCursor from "@/components/SmokeyCursor";
import SmoothScroll from "@/components/SmoothScroll";
import TransitionLink from "@/components/TransitionLink";
import WorkList from "@/components/WorkList";

function SectionHead({ index, title, note }: { index: string; title: string; note: string }) {
  return (
    <div className="section-head">
      <span className="mono">{index}</span>
      <h2 data-reveal>{title}</h2>
      <span className="mono">( {note} )</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
        <Loader />
      <SmoothScroll />
      <ScrollProgress />
      <Effects />
      <SmokeyCursor />
      <Nav />

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="hero__top mono">
            <span className="reveal-fade">( Portfolio — 2026 )</span>
            <span className="reveal-fade">{site.available}</span>
          </div>

          <h1 className="hero__title" aria-label="Designing digital products that feel inevitable">
            <span className="line">
              <span className="line__inner">Designing</span>
            </span>
            <span className="line line--indent">
              <span className="line__inner">
                digital{" "}
                <span className="hero__pill">
                  <span className="hero__pill-art" />
                </span>{" "}
                products
              </span>
            </span>
            <span className="line">
              <span className="line__inner">that feel</span>
            </span>
            <span className="line line--right">
              <span className="line__inner">
                inevitable<span className="accent">.</span>
              </span>
            </span>
          </h1>

          <div className="hero__bottom">
            <p className="hero__intro reveal-fade">
              Web developer and designer based in {site.city}. Ten years building responsive,
              high-conversion websites, e-commerce stores and the automations behind them.
            </p>
            <a href="#work" className="scroll-cue mono reveal-fade" data-magnetic>
              <span>Scroll</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12m0 0l5-5m-5 5L2 8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...marquee, ...marquee].map((item, i) => (
              <span key={i} className="marquee__item">
                <MarqueeIcon name={item} />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Work — pinned horizontal gallery */}
        <HorizontalWork />

        {/* Work index */}
        <section className="work">
          <SectionHead index="02" title="Index" note="Websites" />
          <WorkList />
        </section>

        {/* Systems — built pipelines, not websites */}
        <section className="sys" id="systems">
          <SectionHead index="03" title="Systems" note="Automation & tracking" />
          <Systems />
        </section>

        {/* About */}
        <section className="about" id="about">
          <SectionHead index="04" title="About" note={`Based in ${site.city}`} />

          <div className="about__lead">
            <FluidPanel className="fluid--behind" track="parent" />
            <p className="about__statement" data-words>
            {statement.split(" ").map((word, i) => (
              <span key={i} className="w">
                {word}{" "}
              </span>
              ))}
            </p>
          </div>

          <div className="about__grid">
            <div className="portrait" data-reveal>
              {/* public/portrait.webp */}
              <ShaderImage srcs={["/portrait.webp"]} index={0} alt={site.name} />
              <FluidPanel className="fluid--overlay" track="parent" />
              <span className="mono">{site.name}</span>
            </div>
            <div className="about__stats">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="stat"
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="stat__num">
                    <span data-counter={s.value}>0</span>
                    {s.suffix}
                  </span>
                  <span className="mono">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="services" id="services">
          <SectionHead index="05" title="Services" note="What I do" />
          <Services />
        </section>

        {/* Recognition */}
        <section className="recog">
          <SectionHead index="06" title="Recognition" note="Experience & results" />
          <div className="table">
            {awards.map((a, i) => (
              <div
                key={a.org + a.title}
                className="table__row"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span>{a.org}</span>
                <span>{a.title}</span>
                <span className="mono">{a.count}</span>
                <span className="mono">{a.year}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Contact */}
      <footer className="contact" id="contact">
        <div className="contact__top mono">
          <span>( Have a project in mind? )</span>
          <span>07</span>
        </div>

        <TransitionLink href="/contact" className="contact__cta" data-inview>
          <span className="line">
            <span className="line__inner">Let&apos;s work</span>
          </span>
          <span className="line">
            <span className="line__inner">
              together<span className="contact__arrow">↗</span>
            </span>
          </span>
        </TransitionLink>

        <div className="contact__grid" data-reveal>
          <div>
            <span className="mono label">Contact</span>
            <RollLink href={`mailto:${site.email}`} label={site.email} />
            <RollLink href={`tel:${site.phone.replace(/\s/g, "")}`} label={site.phone} />
          </div>
          <div>
            <span className="mono label">Social</span>
            {site.socials.map((s) => (
              <RollLink key={s.label} href={s.href} label={s.label} />
            ))}
          </div>
          <div>
            <span className="mono label">Local time</span>
            <Clock timeZone={site.timeZone} seconds />
          </div>
          <div className="contact__back">
            <BackToTop />
          </div>
        </div>

        <div className="contact__bottom mono">
          <span>© 2026 {site.name}</span>
          <span>Designed & built in-house</span>
        </div>

        <svg className="surname" viewBox={surnameViewBox} data-inview aria-hidden="true">
          {surnamePaths.map((d, i) => (
            <path key={i} d={d} pathLength={1} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </svg>
      </footer>
    </>
  );
}

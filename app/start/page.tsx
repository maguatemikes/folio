import type { Metadata } from "next";
import TransitionLink from "@/components/TransitionLink";
import { site } from "@/lib/data";
import Clock from "@/components/Clock";
import Effects from "@/components/Effects";
import ProjectForm from "@/components/ProjectForm";
import RollLink from "@/components/RollLink";
import SmokeyCursor from "@/components/SmokeyCursor";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Start a project — Florence Michael Maguate",
  description:
    "Tell me what you are building: services, budget and timeline, and I will come back with a plan.",
};

export default function StartPage() {
  return (
    <>
      <SmoothScroll />
      <Effects />
      <SmokeyCursor />

      <header className="nav">
        <TransitionLink href="/" className="nav__logo" data-magnetic>
          {site.name}
          <sup>©</sup>
        </TransitionLink>
        <div className="nav__meta mono">
          <span>{site.role}</span>
          <span className="nav__time">
            <span className="dot" />
            <Clock timeZone={site.timeZone} /> {site.timeLabel}
          </span>
        </div>
        <nav className="nav__links">
          <TransitionLink href="/" className="link" data-magnetic>
            <span data-text="Back to work">Back to work</span>
          </TransitionLink>
        </nav>
      </header>

      <main className="start">
        <section className="start__head">
          <div className="start__meta mono">
            <span>( Project brief )</span>
            <span>{site.available}</span>
          </div>
          <h1 className="start__title">
            <span className="line">
              <span className="line__inner">Let&apos;s work</span>
            </span>
            <span className="line">
              <span className="line__inner">
                together<span className="accent">.</span>
              </span>
            </span>
          </h1>
          <p className="start__intro reveal-fade">
            Five quick questions. The more you share, the sharper the plan and estimate I can send
            back — usually within two working days.
          </p>
        </section>

        <ProjectForm />

        <section className="start__foot mono">
          <span>Prefer email?</span>
          <RollLink href={`mailto:${site.email}`} label={site.email} />
        </section>
      </main>
    </>
  );
}

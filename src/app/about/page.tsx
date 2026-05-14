"use client";

import { motion } from "framer-motion";
import { Target, Heart, Users, Award, Globe, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "12K+", label: "Products Sold" },
  { value: "4.9", label: "Average Rating" },
  { value: "30+", label: "Countries Served" },
];

const values = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Our Mission",
    desc: "To make premium quality products accessible to everyone, everywhere, through a seamless and trusted shopping experience.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Our Vision",
    desc: "To become the most customer-centric marketplace — where innovation meets reliability, and every interaction feels effortless.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "What We Stand For",
    desc: "Quality over quantity. Transparency over hype. Community over noise. We carefully curate every product we offer.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Reach",
    desc: "From local artisans to international brands, we connect the world's best products with discerning customers across 30+ countries.",
  },
];

const team = [
  {
    name: "Elena Vasquez",
    role: "Co-Founder & CEO",
    bio: "Former product lead at two unicorn startups. Obsessed with building experiences people love.",
    avatar: "https://i.pravatar.cc/300?img=1",
  },
  {
    name: "Marcus Chen",
    role: "Co-Founder & CTO",
    bio: "Full-stack engineer and systems thinker. Built platforms serving millions of daily active users.",
    avatar: "https://i.pravatar.cc/300?img=3",
  },
  {
    name: "Aisha Okonkwo",
    role: "Head of Design",
    bio: "Award-winning product designer. Believes the best interface is one you don't notice.",
    avatar: "https://i.pravatar.cc/300?img=5",
  },
  {
    name: "Liam O'Brien",
    role: "Head of Operations",
    bio: "Supply chain veteran with experience across 3 continents. Precision is his middle name.",
    avatar: "https://i.pravatar.cc/300?img=8",
  },
];

const milestones = [
  { year: "2021", event: "Founded with a vision to transform online shopping" },
  { year: "2022", event: "Reached 10,000 customers and launched our mobile app" },
  { year: "2023", event: "Expanded to 20+ countries with multi-currency support" },
  { year: "2024", event: "Launched AI-powered recommendations and same-day delivery" },
  { year: "2025", event: "50,000+ customers and growing — the journey continues" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#141413]">
      {/* Hero */}
      <section className="relative overflow-hidden py-32 px-4">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <FadeSection>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-6">
              Our Story
            </p>
          </FadeSection>
          <FadeSection delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Built on trust,{" "}
              <span className="text-[#141413]">driven by craft</span>
            </h1>
          </FadeSection>
          <FadeSection delay={0.2}>
            <p className="text-lg md:text-xl text-[#6B6B67] max-w-2xl mx-auto leading-relaxed">
              We started with a simple idea: shopping should feel special. Not like
              scrolling through an endless catalog — but like walking into a perfectly
              curated store where everything is worth your attention.
            </p>
          </FadeSection>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#E5E5E0] py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeSection key={i} delay={i * 0.08}>
              <div className="text-center">
                <p className="text-4xl font-bold text-[#141413]">{stat.value}</p>
                <p className="text-sm text-[#6B6B67] mt-2">{stat.label}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeSection>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-4 text-center">
              What We Believe
            </p>
            <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">
              Our values define everything we do
            </h2>
          </FadeSection>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <FadeSection key={i} delay={i * 0.08}>
                <div className="bg-white border border-[#E5E5E0] rounded-2xl p-8 hover:border-[#E5E5E0] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#141413]/10 text-[#141413] flex items-center justify-center mb-6">
                    {v.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{v.title}</h3>
                  <p className="text-[#6B6B67] leading-relaxed">{v.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 border-t border-[#E5E5E0]">
        <div className="max-w-3xl mx-auto">
          <FadeSection>
            <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">
              Our Journey
            </h2>
          </FadeSection>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <FadeSection key={i} delay={i * 0.08}>
                <div className="flex gap-6 py-8 border-b border-[#E5E5E0] last:border-0">
                  <div className="flex-shrink-0 w-16 text-sm font-mono text-[#141413] font-semibold">
                    {m.year}
                  </div>
                  <div className="flex-1 text-[#6B6B67] leading-relaxed pt-0.5">
                    {m.event}
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 border-t border-[#E5E5E0]">
        <div className="max-w-6xl mx-auto">
          <FadeSection>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-4 text-center">
              The People
            </p>
            <h2 className="text-4xl font-bold text-center mb-4 tracking-tight">
              Meet our team
            </h2>
            <p className="text-[#6B6B67] text-center max-w-xl mx-auto mb-16">
              A small, dedicated group of thinkers, builders, and optimists who
              genuinely care about the experience we create.
            </p>
          </FadeSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <FadeSection key={i} delay={i * 0.08}>
                <div className="bg-white border border-[#E5E5E0] rounded-2xl overflow-hidden hover:border-[#E5E5E0] transition-colors">
                  <div className="aspect-square bg-[#F4F4F1] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-sm mb-0.5">{member.name}</h3>
                    <p className="text-xs text-[#141413] mb-3">{member.role}</p>
                    <p className="text-xs text-[#6B6B67] leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-[#E5E5E0]">
        <div className="max-w-2xl mx-auto text-center">
          <FadeSection>
            <Users className="w-10 h-10 text-[#141413] mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              Join our growing community
            </h2>
            <p className="text-[#6B6B67] mb-8 leading-relaxed">
              Over 50,000 customers trust us every day. Whether you&apos;re shopping for
              yourself or your business, we&apos;re glad you&apos;re here.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#141413] text-[#FAFAF8] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </a>
          </FadeSection>
        </div>
      </section>
    </div>
  );
}

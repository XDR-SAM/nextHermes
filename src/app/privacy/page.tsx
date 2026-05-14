"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
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

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact us for support. This includes your name, email address, postal address, phone number, payment information, and any other details you choose to share.

We also automatically collect certain technical information when you visit our platform, including your IP address, browser type, operating system, device identifiers, pages visited, and referring URL. This data helps us understand how you use our service so we can continuously improve it.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to process transactions and send related information, including purchase confirmations, invoices, and shipping updates. We also use it to send promotional communications (you can opt out at any time), respond to your comments and questions, monitor and analyze usage patterns, detect and prevent fraud or abuse, and improve our products and services.

We may combine data from multiple sources to build a more complete picture of how you interact with our platform, which allows us to personalize your experience and show you more relevant products and recommendations.`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information to third parties. We share your data only in the following circumstances:

With trusted service providers who help us operate our platform — such as payment processors, shipping carriers, and analytics services — under strict confidentiality agreements.

When required by law, regulation, or legal process, such as in response to a court order, subpoena, or government request.

In connection with a business transfer, merger, acquisition, or sale of assets, in which case your information may be transferred as part of that transaction.

With your explicit consent, for any other purpose disclosed at the time you provide the information.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g., tax records, transaction logs) or necessary to protect our legal rights.

Anonymized and aggregated data that cannot be used to identify you may be retained indefinitely for analytics and product improvement purposes.`,
  },
  {
    title: "5. Data Security",
    content: `We implement industry-standard technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes TLS encryption for data in transit, AES-256 encryption for data at rest, regular security audits, and access controls that limit employee access to only what's necessary.

While we strive to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. If you suspect a security breach, please contact us immediately at security@hermes.store.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your location, you may have the right to access, correct, delete, or port your personal data. You can also object to certain processing or request that we restrict how we use your information.

To exercise any of these rights, log into your account settings or contact us at privacy@hermes.store. We will respond to your request within 30 days. For account deletion, your data will be removed within 30 days, though some copies may remain in backup systems for up to 90 days.

You can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email or updating your preferences in account settings.`,
  },
  {
    title: "7. Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to collect and store information about your browsing activity. Essential cookies are required for the platform to function properly. Performance cookies help us understand how visitors interact with our site. Functional cookies remember your preferences. Targeting cookies are used to deliver relevant advertisements.

You can control cookie preferences through our Cookie Settings page or your browser settings. Disabling certain cookies may limit your ability to use some features of our platform.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Our platform is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete that information as quickly as possible. If you believe we may have collected such information, please contact us at privacy@hermes.store.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of any material changes by posting the updated policy on this page with a revised "Last Updated" date.

For significant changes, we will provide additional notice via email or a prominent notice on our platform. We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:

Email: privacy@hermes.store
Address: 123 Commerce Street, San Francisco, CA 94102

We aim to respond to all inquiries within 30 days. For urgent matters related to data breaches, please include "URGENT" in your subject line.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#141413]">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-3xl mx-auto relative">
          <FadeSection>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-4">
              Legal
            </p>
          </FadeSection>
          <FadeSection delay={0.1}>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Privacy Policy</h1>
          </FadeSection>
          <FadeSection delay={0.2}>
            <p className="text-[#6B6B67]">
              Last updated: May 12, 2026
            </p>
          </FadeSection>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <FadeSection>
          <p className="text-[#6B6B67] leading-relaxed mb-8 border-b border-[#E5E5E0] pb-8">
            At Hermes, we take your privacy seriously. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you
            use our platform. Please read this policy carefully. By using our
            service, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </FadeSection>

        {sections.map((section, i) => (
          <FadeSection key={i} delay={i * 0.03}>
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
              {section.content.split("\n\n").map((para, j) => (
                <p key={j} className="text-[#6B6B67] text-sm leading-relaxed mb-3 whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          </FadeSection>
        ))}
      </div>
    </div>
  );
}

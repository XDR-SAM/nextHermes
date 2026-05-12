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
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Hermes platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our service.

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the platform after any changes constitutes acceptance of the new terms. It is your responsibility to review these terms periodically.`,
  },
  {
    title: "2. Description of Service",
    content: `Hermes provides an online marketplace platform that connects buyers with sellers of various products. Our platform allows users to browse, compare, and purchase products from third-party sellers, as well as manage their orders and accounts.

We act as an intermediary between buyers and sellers. The actual contract for sale is directly between the buyer and the seller. While we facilitate transactions, we are not a party to that contract and do not guarantee the quality, safety, or legality of items sold.`,
  },
  {
    title: "3. User Accounts",
    content: `To access certain features, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activity. You may not use another person's account without their permission.`,
  },
  {
    title: "4. Buying & Selling",
    content: `When you place an order, you are entering into a legally binding contract to purchase the item from the seller. Sellers agree to list accurate descriptions, ship within the stated timeframe, and meet all legal requirements for their products.

Prices are listed in the currency shown and include applicable taxes unless otherwise stated. We reserve the right to cancel orders that appear fraudulent or violate our policies. Sellers are responsible for setting their own prices and fulfilling their orders.`,
  },
  {
    title: "5. Payment & Billing",
    content: `We use secure third-party payment processors to handle all transactions. We do not store your full credit card details on our servers. Payment must be received in full before an order is processed.

For digital goods and subscriptions, you authorize us to charge your payment method for the recurring subscription amount until cancelled. You can cancel subscriptions at any time through your account settings.`,
  },
  {
    title: "6. Shipping & Delivery",
    content: `Shipping times are estimates provided by sellers and carriers. We do not guarantee delivery dates. International orders may be subject to customs duties, taxes, and import fees, which are the responsibility of the buyer.

Risk of loss and title for items purchased pass to the buyer upon delivery to the carrier. We are not responsible for delays caused by carriers, customs, or events beyond our reasonable control.`,
  },
  {
    title: "7. Returns & Refunds",
    content: `Our returns policy allows most items to be returned within 30 days of delivery for a full refund, provided they are in original condition with tags attached. Certain categories (e.g., perishable goods, personalized items, intimate apparel) may not be eligible for return.

Refunds are processed to the original payment method within 5–10 business days of receiving the returned item. Sellers may have their own return policies that supplement but do not override this policy.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on the Hermes platform — including text, graphics, logos, button icons, images, audio clips, and software — is the property of Hermes or its content suppliers and is protected by copyright and trademark laws.

You may not reproduce, distribute, modify, or create derivative works from any content on our platform without our express written permission. Any unauthorized use of our intellectual property may result in legal action.`,
  },
  {
    title: "9. Prohibited Conduct",
    content: `You agree not to use our platform for any unlawful purpose or in any way that could harm, harass, or defraud others. The following activities are strictly prohibited:

Posting false, misleading, or defamatory content. Attempting to circumvent our security systems. Using automated bots or scrapers without permission. Infringing on the intellectual property rights of others. Harassing, threatening, or intimidating other users. Uploading viruses, malware, or other harmful code.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the fullest extent permitted by law, Hermes shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or any products purchased through it.

Our total liability for any claim arising from your use of the platform shall not exceed the amount you paid for the specific order giving rise to the claim. Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so the above limitations may not apply to you.`,
  },
  {
    title: "11. Indemnification",
    content: `You agree to indemnify and hold harmless Hermes, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, your violation of these terms, or your violation of any third-party rights.`,
  },
  {
    title: "12. Governing Law",
    content: `These terms shall be governed by and construed in accordance with the laws of the State of California, USA, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of the platform shall be resolved in the state or federal courts located in San Francisco County, California.`,
  },
  {
    title: "13. Contact Information",
    content: `If you have any questions about these Terms of Service, please contact us:

Email: legal@hermes.store
Address: 123 Commerce Street, San Francisco, CA 94102

We aim to respond to all inquiries within 30 business days.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
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
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4">
              Legal
            </p>
          </FadeSection>
          <FadeSection delay={0.1}>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Terms of Service</h1>
          </FadeSection>
          <FadeSection delay={0.2}>
            <p className="text-[var(--text-secondary)]">
              Last updated: May 12, 2026
            </p>
          </FadeSection>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <FadeSection>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-8 border-b border-[var(--border)] pb-8">
            Please read these Terms of Service carefully before using the Hermes
            platform. These terms govern your access to and use of our website,
            services, and applications. By using Hermes, you agree to be bound by
            these terms in full.
          </p>
        </FadeSection>

        {sections.map((section, i) => (
          <FadeSection key={i} delay={i * 0.03}>
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
              {section.content.split("\n\n").map((para, j) => (
                <p key={j} className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3 whitespace-pre-line">
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

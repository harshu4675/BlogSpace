import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, including your name, email address, and profile information when you create an account. We also collect content you create such as posts, comments, and bookmarks.\n\nAutomatically collected data includes your IP address, browser type, device information, pages visited, and interaction patterns. We use cookies and similar technologies for session management and analytics.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to:\n• Provide, maintain, and improve BlogSpace services\n• Create and manage your account\n• Personalize your content experience and recommendations\n• Send newsletters and important service updates\n• Analyze usage patterns to improve our platform\n• Ensure platform security and prevent fraud\n• Comply with legal obligations`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information. We may share information with:\n• Service providers who help us operate the platform (hosting, analytics, email)\n• Legal authorities when required by law or to protect rights and safety\n• Other users when you make your profile or content public\n• Business partners with your explicit consent`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures including encryption in transit (TLS/SSL), secure password hashing (bcrypt), rate limiting, input sanitization, and regular security audits. However, no internet service is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "5. Your Rights & Choices",
    content: `You have the right to:\n• Access, update, or delete your personal information\n• Opt out of marketing emails and newsletters\n• Request a copy of your data\n• Delete your account and associated data\n• Restrict or object to certain data processing\n\nTo exercise these rights, visit your account settings or contact us at privacy@blogspace.com.`,
  },
  {
    title: "6. Cookies",
    content: `We use essential cookies for authentication and session management. We also use analytics cookies to understand how the platform is used. You can control cookie preferences through your browser settings. Blocking essential cookies may impact platform functionality.`,
  },
  {
    title: "7. Third-Party Links",
    content: `BlogSpace may contain links to external websites. We are not responsible for the privacy practices or content of those sites. We encourage you to read their privacy policies before providing any personal information.`,
  },
  {
    title: "8. Children's Privacy",
    content: `BlogSpace is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this policy from time to time. We will notify you of significant changes via email or platform notification. Your continued use of BlogSpace after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact Us",
    content: `For privacy-related questions or concerns:\n• Email: privacy@blogspace.com\n• Address: BlogSpace Inc., San Francisco, CA 94102\n• Response time: Within 30 business days`,
  },
];

const Privacy = () => (
  <>
    <SEO
      title="Privacy Policy"
      description="BlogSpace privacy policy — how we collect, use, and protect your information."
    />
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
        <div className="container-custom py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-900 dark:text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-dark-500 dark:text-dark-400">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.div>
        </div>
      </div>
      <div className="container-custom py-10 sm:py-14">
        <div className="max-w-3xl space-y-8">
          <p className="text-dark-600 dark:text-dark-300 leading-relaxed">
            At BlogSpace, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-3">
                {s.title}
              </h2>
              <div className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line text-[15px]">
                {s.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Privacy;

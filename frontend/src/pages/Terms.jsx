import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using BlogSpace, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part, you may not access the service. We reserve the right to modify these terms at any time.`,
  },
  {
    title: "2. Account Registration",
    content: `To use certain features, you must create an account. You agree to:\n• Provide accurate, current, and complete information\n• Maintain and update your account information\n• Keep your password secure and confidential\n• Accept responsibility for all activity under your account\n• Notify us immediately of any unauthorized use\n\nYou must be at least 13 years old to create an account. Accounts for those under 18 require parental consent.`,
  },
  {
    title: "3. User Content",
    content: `You retain ownership of content you create on BlogSpace. By posting content, you grant BlogSpace a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content on the platform.\n\nYou agree not to post content that:\n• Infringes on intellectual property rights\n• Contains hate speech, harassment, or threats\n• Is unlawful, defamatory, or obscene\n• Contains malware or malicious code\n• Violates any applicable law or regulation`,
  },
  {
    title: "4. Prohibited Activities",
    content: `You agree not to:\n• Use the platform for any illegal purpose\n• Harass, abuse, or harm other users\n• Create fake accounts or impersonate others\n• Scrape, crawl, or use bots on the platform\n• Attempt to gain unauthorized access to any systems\n• Interfere with or disrupt the platform's operation\n• Use the platform to distribute spam or advertisements\n• Circumvent any content filtering or security measures`,
  },
  {
    title: "5. Intellectual Property",
    content: `BlogSpace and its original content (excluding user-generated content), features, and functionality are owned by BlogSpace Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.\n\nThe BlogSpace name, logo, and all related marks are trademarks of BlogSpace Inc.`,
  },
  {
    title: "6. Content Moderation",
    content: `We reserve the right to remove or modify any content that violates these terms. We may suspend or terminate accounts that repeatedly violate our guidelines. We use a combination of automated tools and human review to moderate content.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `BlogSpace is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, consequential, or punitive damages.\n\nWe do not guarantee the accuracy, completeness, or usefulness of any content on the platform.`,
  },
  {
    title: "8. Termination",
    content: `We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the platform ceases immediately. You may also delete your account at any time through your settings.`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.`,
  },
  {
    title: "10. Contact",
    content: `For questions about these Terms of Service:\n• Email: legal@blogspace.com\n• Address: BlogSpace Inc., San Francisco, CA 94102`,
  },
];

const Terms = () => (
  <>
    <SEO
      title="Terms of Service"
      description="BlogSpace terms of service — rules and guidelines for using our platform."
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
              Terms of Service
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
            Welcome to BlogSpace! These Terms of Service govern your use of our
            website and services. Please read them carefully before using the
            platform.
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

export default Terms;

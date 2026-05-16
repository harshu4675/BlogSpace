import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineGlobeAlt,
  HiOutlineUsers,
  HiOutlineHeart,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import SEO from "../components/common/SEO";

import AboutImg from "../images/About.png";

const stats = [
  { number: "5+", label: "Active Readers" },
  { number: "10+", label: "Published Articles" },
  { number: "5+", label: "Writers" },
  { number: "10+", label: "Categories" },
];

const values = [
  {
    icon: HiOutlineLightBulb,
    title: "Innovation",
    desc: "We push boundaries and embrace new ideas that shape the future of content creation.",
  },
  {
    icon: HiOutlineUsers,
    title: "Community",
    desc: "We foster a vibrant community where writers and readers connect, learn, and grow together.",
  },
  {
    icon: HiOutlineHeart,
    title: "Authenticity",
    desc: "We champion genuine, original voices and real stories that make a difference.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Trust",
    desc: "We maintain the highest standards of integrity, privacy, and content quality.",
  },
  {
    icon: HiOutlineGlobeAlt,
    title: "Inclusivity",
    desc: "We welcome diverse perspectives and create a space where everyone belongs.",
  },
  {
    icon: HiOutlineRocketLaunch,
    title: "Growth",
    desc: "We help creators grow their audience and refine their craft every single day.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const About = () => (
  <>
    <SEO
      title="About Us"
      description="Learn about BlogSpace — our mission, values, and the team behind the platform."
    />

    {/* Hero */}
    <section className="relative overflow-hidden gradient-bg-subtle">
      <div className="absolute inset-0 bg-hero-pattern opacity-40 dark:opacity-15" />
      <div className="container-custom relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...fadeUp}>
            <span className="badge-primary mb-4">About BlogSpace</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-900 dark:text-white leading-tight mb-6">
              Empowering <span className="gradient-text">voices</span> that
              matter
            </h1>
            <p className="text-lg text-dark-500 dark:text-dark-400 leading-relaxed mb-8 max-w-lg">
              BlogSpace is the modern publishing platform where creators share
              bold ideas, readers discover new perspectives, and communities
              thrive.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Join the Community
              </Link>
              <Link to="/blog" className="btn-secondary">
                Explore Articles
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={AboutImg}
                alt="Team collaboration"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-primary-500 blur-2xl opacity-30" />
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-accent-500 blur-3xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-12 bg-white dark:bg-dark-950 border-y border-dark-100 dark:border-dark-800">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">
                {s.number}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-16 sm:py-24 bg-dark-50 dark:bg-dark-900">
      <div className="container-custom">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-dark-500 dark:text-dark-400 leading-relaxed">
            We believe everyone has a story worth telling. Our mission is to
            democratize publishing by giving creators the tools, audience, and
            community they need to share their ideas and make an impact —
            without barriers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-600 to-accent-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />
      <div className="container-custom relative z-10 text-center">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to join the community?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            Start reading, writing, and connecting with creators worldwide.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-white/90 shadow-xl transition-all"
          >
            Get Started — It's Free
          </Link>
        </motion.div>
      </div>
    </section>
  </>
);

export default About;

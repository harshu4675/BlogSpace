import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import SEO from "../components/common/SEO";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message)
      return toast.error("Please fill all required fields");
    setLoading(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you soon 🎉");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: HiOutlineEnvelope,
      label: "Email",
      value: "harshubusiness21@gmail.com",
      href: "mailto:harshubusiness21@gmail.com",
    },

    {
      icon: HiOutlineMapPin,
      label: "Office",
      value: "Indore",
      href: "#",
    },
  ];

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with BlogSpace team. We'd love to hear from you."
      />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        <div className="gradient-bg-subtle">
          <div className="container-custom py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <span className="badge-primary mb-4">Contact Us</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-900 dark:text-white mb-4">
                Let's <span className="gradient-text">talk</span>
              </h1>
              <p className="text-lg text-dark-500 dark:text-dark-400">
                Have questions, feedback, or partnership ideas? We'd love to
                hear from you.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Info Cards */}
            <div className="space-y-5">
              {contactInfo.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-5 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 uppercase tracking-wider font-semibold">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                </motion.a>
              ))}

              <div className="p-5 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/20 rounded-2xl border border-primary-100 dark:border-primary-800">
                <h3 className="font-bold text-dark-900 dark:text-white mb-2">
                  💡 Quick Tip
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  For fastest response, email us directly. We typically reply
                  within 24 hours on business days.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-6 sm:p-8"
              >
                <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
                  Send us a message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="What is this about?"
                    className="input-field"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what's on your mind..."
                    className="input-field resize-none"
                    rows={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full sm:w-auto py-3.5 px-8"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <HiOutlinePaperAirplane className="w-5 h-5" /> Send
                      Message
                    </>
                  )}
                </button>
              </motion.form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;

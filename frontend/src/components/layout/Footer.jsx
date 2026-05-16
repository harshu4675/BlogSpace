import { Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineEnvelope, HiArrowRight } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const { data } = await api.post("/newsletter/subscribe", { email });
      toast.success(data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Blog", path: "/blog" },
      { label: "Categories", path: "/blog?view=categories" },
      { label: "Trending", path: "/blog?sort=trending" },
      { label: "Search", path: "/search" },
    ],
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Careers", path: "/about" },
      { label: "Advertise", path: "/contact" },
    ],
    Legal: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Cookie Policy", path: "/privacy" },
    ],
  };

  return (
    <footer className="bg-dark-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800">
      {/* Newsletter */}
      <div className="container-custom py-10 sm:py-14">
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
                Stay in the loop ✨
              </h3>
              <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto lg:mx-0">
                Get the best articles delivered to your inbox every week.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[280px]">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                  {subscribing ? "Subscribing..." : "Subscribe"}
                  {!subscribing && <HiArrowRight className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2 text-center sm:text-left">
                No spam, unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container-custom pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-lg font-black text-white">B</span>
              </div>
              <span className="text-lg font-bold text-dark-900 dark:text-white">
                Blog<span className="text-primary-600">Space</span>
              </span>
            </Link>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
              Where stories come alive. Read, write, and connect.
            </p>
            <div className="flex gap-3">
              {["twitter", "instagram", "github", "youtube"].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-9 h-9 rounded-lg bg-dark-200 dark:bg-dark-700 flex items-center justify-center text-dark-500 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-950/50 dark:hover:text-primary-400 transition-all"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase">
                    {social[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-dark-200 dark:border-dark-800 gap-4">
          <p className="text-sm text-dark-400">
            © {currentYear} BlogSpace. All rights reserved.
          </p>
          <p className="text-sm text-dark-400">Made with ❤️ for the web</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

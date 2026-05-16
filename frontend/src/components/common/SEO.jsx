import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "",
  description = "BlogSpace — Discover amazing stories, connect with creators, and share your voice.",
  keywords = "blog, articles, stories, writing, tech, lifestyle",
  image = "/og-image.jpg",
  url = "",
  type = "website",
  author = "",
  publishedAt = "",
}) => {
  const siteTitle = "BlogSpace";
  const fullTitle = title ? `${title} — ${siteTitle}` : siteTitle;
  const fullUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
    </Helmet>
  );
};

export default SEO;

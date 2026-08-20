// Central WishFly site configuration.
// Social URLs are intentionally empty until real accounts exist —
// set the value here and every footer/social icon updates site-wide.
export const SITE = {
  name: "WishFly",
  tagline: "Make Every Moment Special",
  description:
    "WishFly is a digital wishes platform for creating beautiful, personal celebration pages you can share with a single link.",
  founder: "Rabindranath Samantaray",
  email: "rnscreation143@gmail.com",
  phone: "+91 8249167558",
  phoneHref: "+918249167558",
  social: {
    facebook: "",
    instagram: "",
    whatsapp: "",
    twitter: "",
    youtube: "",
  },
};

export const MAIN_NAV = [
  { label: "Templates", href: "/templates" },
  { label: "Categories", href: "/categories" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export const FOOTER_NAV = [
  {
    title: "Quick Links",
    items: [
      { label: "Home", href: "/" },
      { label: "Templates", href: "/templates" },
      { label: "Categories", href: "/categories" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "/help-center" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Affiliate Program", href: "/affiliate-program" },
    ],
  },
];

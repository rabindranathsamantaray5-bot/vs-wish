const DEFAULT_FROM = "var(--color-purple-100, #f3e8ff)";
const DEFAULT_TO = "var(--color-pink-100, #fce7f3)";

const colorFromUtility = (utility, prefix) => {
  const match = utility.match(new RegExp(`^${prefix}-([a-z]+(?:-[a-z]+)*-[0-9]{2,3})$`));
  return match ? `var(--color-${match[1]})` : null;
};

/** Convert database gradient settings into runtime CSS so new admin colors work after build. */
export function getCategoryBackgroundStyle(value) {
  const background = String(value || "").trim();

  if (/^(linear-gradient|radial-gradient)\(/i.test(background)) {
    return { backgroundImage: background };
  }

  if (/^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(background)) {
    return { background };
  }

  const utilities = background.split(/\s+/);
  const from = utilities.map((item) => colorFromUtility(item, "from")).find(Boolean);
  const via = utilities.map((item) => colorFromUtility(item, "via")).find(Boolean);
  const to = utilities.map((item) => colorFromUtility(item, "to")).find(Boolean);
  const stops = [from || DEFAULT_FROM, via, to || DEFAULT_TO].filter(Boolean).join(", ");

  return { backgroundImage: `linear-gradient(135deg, ${stops})` };
}

export function isCategoryImage(value) {
  return /^(https?:\/\/|data:image\/|blob:|\/|\.\/|\.\.\/)/i.test(String(value || "").trim());
}

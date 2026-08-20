import { useNavigate, useSearch, useParams, useLocation } from "@tanstack/react-router";

export const useRouter = () => {
  const navigate = useNavigate();
  return {
    push: (url) => navigate({ to: url }),
    replace: (url) => navigate({ to: url, replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
};

export const useSearchParams = () => {
  const search = useSearch({ strict: false });
  return {
    get: (key) => search[key],
    getAll: (key) => {
      const val = search[key];
      return Array.isArray(val) ? val : val ? [val] : [];
    },
    has: (key) => search[key] !== undefined,
    entries: () => Object.entries(search),
  };
};

export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};

export { useParams };

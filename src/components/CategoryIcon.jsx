import { useEffect, useState } from "react";
import { isCategoryImage } from "@/lib/category-display";

export function CategoryIcon({ value, name, imageClassName = "", emojiClassName = "" }) {
  const icon = String(value || "").trim();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [icon]);

  if (icon && isCategoryImage(icon) && !imageFailed) {
    return (
      <img
        src={icon}
        alt={name || "Category"}
        onError={() => setImageFailed(true)}
        className={imageClassName}
        loading="lazy"
      />
    );
  }

  return (
    <span role="img" aria-label={name || "Category"} className={emojiClassName}>
      {icon && !isCategoryImage(icon) ? icon : "🎁"}
    </span>
  );
}

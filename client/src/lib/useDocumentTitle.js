import { useEffect } from "react";

/** Sets the document title (and optional meta description) per page for SEO. */
export default function useDocumentTitle(title, description) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · SolarCalc` : "SolarCalc — Will rooftop solar pay off?";
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) { tag = document.createElement("meta"); tag.name = "description"; document.head.appendChild(tag); }
      tag.content = description;
    }
    return () => { document.title = prev; };
  }, [title, description]);
}

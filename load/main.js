// main.js

const tests = {
  headingCount() {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return {
      title: "Heading count",
      content: `Found <strong>${headings.length}</strong> headings on this page.`
    };
  },

  imagesMissingAlt() {
    const images = [...document.querySelectorAll("img")];
    const missingAlt = images.filter(img => !img.hasAttribute("alt"));

    return {
      title: "Images missing alt",
      content: missingAlt.length === 0
        ? "All images have an <code>alt</code> attribute."
        : `
          <p><strong>${missingAlt.length}</strong> image(s) are missing an <code>alt</code> attribute.</p>
          <ul>
            ${missingAlt.slice(0, 20).map((img, i) => `
              <li>Image ${i + 1}: ${escapeHtml(img.outerHTML.slice(0, 200))}</li>
            `).join("")}
          </ul>
          ${missingAlt.length > 20 ? "<p>Only the first 20 are shown.</p>" : ""}
        `
    };
  },

  pageTitle() {
    return {
      title: "Page title",
      content: document.title
        ? `Title: <strong>${escapeHtml(document.title)}</strong>`
        : "This page has no title."
    };
  },

  linksWithoutText() {
    const links = [...document.querySelectorAll("a")];
    const badLinks = links.filter(a => !a.textContent.trim() && !a.getAttribute("aria-label"));

    return {
      title: "Links without text",
      content: badLinks.length === 0
        ? "No empty links found."
        : `
          <p><strong>${badLinks.length}</strong> link(s) appear to have no visible text and no <code>aria-label</code>.</p>
          <ul>
            ${badLinks.slice(0, 20).map(a => `
              <li>${escapeHtml(a.outerHTML.slice(0, 200))}</li>
            `).join("")}
          </ul>
        `
    };
  }
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Expose globally so loader.js can access it
window.PageAnalyzerTests = tests;

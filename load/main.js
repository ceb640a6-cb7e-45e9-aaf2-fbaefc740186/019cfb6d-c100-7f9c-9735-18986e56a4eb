// main.js

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeResult({
  id,
  title,
  level = "A",
  status = "manual",
  content = "",
  details = [],
  criterion = ""
}) {
  return { id, title, level, status, content, details, criterion };
}

const tests = {
  imgAlt() {
    const images = [...document.querySelectorAll("img")];
    const missing = images.filter(img => !img.hasAttribute("alt"));

    if (images.length === 0) {
      return makeResult({
        id: "1.1.1-img-alt",
        criterion: "WCAG 2.2 SC 1.1.1 Non-text Content",
        title: "Images have alt attributes",
        status: "pass",
        content: "No <code>img</code> elements found."
      });
    }

    if (missing.length === 0) {
      return makeResult({
        id: "1.1.1-img-alt",
        criterion: "WCAG 2.2 SC 1.1.1 Non-text Content",
        title: "Images have alt attributes",
        status: "pass",
        content: `All <strong>${images.length}</strong> image(s) have an <code>alt</code> attribute.`
      });
    }

    return makeResult({
      id: "1.1.1-img-alt",
      criterion: "WCAG 2.2 SC 1.1.1 Non-text Content",
      title: "Images have alt attributes",
      status: "fail",
      content: `<strong>${missing.length}</strong> of <strong>${images.length}</strong> image(s) are missing <code>alt</code>.`,
      details: missing.slice(0, 20).map((img, i) =>
        `Image ${i + 1}: ${escapeHtml(img.outerHTML.slice(0, 180))}`
      )
    });
  },

  formLabels() {
    const controls = [...document.querySelectorAll("input, select, textarea")].filter(el => {
      const type = (el.getAttribute("type") || "").toLowerCase();
      return type !== "hidden";
    });

    const unlabeled = controls.filter(el => {
      const hasLabel =
        !!el.labels?.length ||
        !!el.getAttribute("aria-label") ||
        !!el.getAttribute("aria-labelledby") ||
        !!el.getAttribute("title");
      return !hasLabel;
    });

    if (controls.length === 0) {
      return makeResult({
        id: "3.3.2-form-labels",
        criterion: "WCAG 2.2 SC 3.3.2 Labels or Instructions",
        title: "Form controls have labels",
        status: "pass",
        content: "No form controls found."
      });
    }

    if (unlabeled.length === 0) {
      return makeResult({
        id: "3.3.2-form-labels",
        criterion: "WCAG 2.2 SC 3.3.2 Labels or Instructions",
        title: "Form controls have labels",
        status: "pass",
        content: `All <strong>${controls.length}</strong> form control(s) appear to have a label or accessible name.`
      });
    }

    return makeResult({
      id: "3.3.2-form-labels",
      criterion: "WCAG 2.2 SC 3.3.2 Labels or Instructions",
      title: "Form controls have labels",
      status: "fail",
      content: `<strong>${unlabeled.length}</strong> of <strong>${controls.length}</strong> control(s) may be missing labels.`,
      details: unlabeled.slice(0, 20).map((el, i) =>
        `Control ${i + 1}: ${escapeHtml(el.outerHTML.slice(0, 180))}`
      )
    });
  },

  pageTitle() {
    const title = (document.title || "").trim();

    if (title) {
      return makeResult({
        id: "2.4.2-page-title",
        criterion: "WCAG 2.2 SC 2.4.2 Page Titled",
        title: "Page has a title",
        status: "pass",
        content: `Page title found: <strong>${escapeHtml(title)}</strong>`
      });
    }

    return makeResult({
      id: "2.4.2-page-title",
      criterion: "WCAG 2.2 SC 2.4.2 Page Titled",
      title: "Page has a title",
      status: "fail",
      content: "The document title is missing or empty."
    });
  },

  htmlLang() {
    const lang = document.documentElement.getAttribute("lang");

    if (lang && lang.trim()) {
      return makeResult({
        id: "3.1.1-html-lang",
        criterion: "WCAG 2.2 SC 3.1.1 Language of Page",
        title: "HTML element has lang",
        status: "pass",
        content: `Found <code>lang="${escapeHtml(lang)}"</code> on the <code>html</code> element.`
      });
    }

    return makeResult({
      id: "3.1.1-html-lang",
      criterion: "WCAG 2.2 SC 3.1.1 Language of Page",
      title: "HTML element has lang",
      status: "fail",
      content: "The <code>html</code> element has no <code>lang</code> attribute."
    });
  },

  skipLink() {
    const links = [...document.querySelectorAll('a[href^="#"]')];
    const skipLike = links.find(a => {
      const text = a.textContent.trim().toLowerCase();
      return text.includes("skip");
    });

    if (skipLike) {
      return makeResult({
        id: "2.4.1-skip-link",
        criterion: "WCAG 2.2 SC 2.4.1 Bypass Blocks",
        title: "Possible skip link exists",
        status: "pass",
        content: `Found a possible skip link: <strong>${escapeHtml(skipLike.textContent.trim())}</strong>`
      });
    }

    return makeResult({
      id: "2.4.1-skip-link",
      criterion: "WCAG 2.2 SC 2.4.1 Bypass Blocks",
      title: "Possible skip link exists",
      status: "warn",
      content: "No obvious skip link was found. This criterion may still be satisfied by another mechanism."
    });
  },

  linkText() {
    const links = [...document.querySelectorAll("a[href]")];
    const bad = links.filter(a => {
      const text = a.textContent.trim();
      const aria = a.getAttribute("aria-label");
      const labelledby = a.getAttribute("aria-labelledby");
      return !text && !aria && !labelledby;
    });

    if (bad.length === 0) {
      return makeResult({
        id: "2.4.4-link-purpose",
        criterion: "WCAG 2.2 SC 2.4.4 Link Purpose (In Context)",
        title: "Links have accessible names",
        status: "pass",
        content: `No empty links found among <strong>${links.length}</strong> link(s).`
      });
    }

    return makeResult({
      id: "2.4.4-link-purpose",
      criterion: "WCAG 2.2 SC 2.4.4 Link Purpose (In Context)",
      title: "Links have accessible names",
      status: "fail",
      content: `<strong>${bad.length}</strong> link(s) appear to have no accessible name.`,
      details: bad.slice(0, 20).map((a, i) =>
        `Link ${i + 1}: ${escapeHtml(a.outerHTML.slice(0, 180))}`
      )
    });
  },

  audioVideoManual() {
    const media = [...document.querySelectorAll("audio, video")];

    return makeResult({
      id: "1.2-media",
      criterion: "WCAG 2.2 SC 1.2.x Time-based Media",
      title: "Audio/video alternatives",
      status: media.length ? "manual" : "pass",
      content: media.length
        ? `Found <strong>${media.length}</strong> audio/video element(s). Check captions, transcripts, and audio descriptions manually.`
        : "No native audio/video elements found."
    });
  },

  keyboardManual() {
    const focusables = [...document.querySelectorAll(`
      a[href],
      button,
      input,
      select,
      textarea,
      summary,
      [tabindex]
    `)];

    return makeResult({
      id: "2.1.1-keyboard",
      criterion: "WCAG 2.2 SC 2.1.1 Keyboard",
      title: "Keyboard access",
      status: "manual",
      content: `Found <strong>${focusables.length}</strong> potentially focusable element(s). Verify full keyboard operation manually.`
    });
  },

  meaningfulSequenceManual() {
    return makeResult({
      id: "1.3.2-meaningful-sequence",
      criterion: "WCAG 2.2 SC 1.3.2 Meaningful Sequence",
      title: "Meaningful reading order",
      status: "manual",
      content: "Check manually whether DOM order and visual presentation preserve a meaningful reading sequence."
    });
  }
};

window.PageAnalyzerTests = tests;

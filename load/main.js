// main.js

const tests = {
  headingCount() {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    return {
      title: "Heading count",
      status: headings.length > 0 ? "pass" : "fail",
      content: `Found <strong>${headings.length}</strong> headings on this page.`
    };
  },

  imagesMissingAlt() {
    const images = [...document.querySelectorAll("img")];
    const missingAlt = images.filter(img => !img.hasAttribute("alt"));

    return {
      title: "Images missing alt",
      status: missingAlt.length === 0 ? "pass" : "fail",
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
      status: document.title ? "pass" : "fail",
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
      status: badLinks.length === 0 ? "pass" : "fail",
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
  },

  imageCount() {
    const images = document.querySelectorAll("img");

    return {
      title: "Image count",
      status: "neutral",
      content: `Found <strong>${images.length}</strong> image(s).`
    };
  },

  oneH1() { //1031
    const count = document.querySelectorAll('h1').length;

    return {
      title: "Only one H1",
      status: (count === 1) ? "pass" : "fail",
      content: (count === 1)
        ? `Heading: <strong>${escapeHtml(document.querySelector('h1').textContent)}</strong>`
        : ((count <= 0) ? "This page has no heading h1." : 'This page has more than one h1 heading.')
    };
  },

  headingJumps() {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];
    const jumps = [];

    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];

      const prevLevel = Number(prev.tagName.substring(1));
      const currLevel = Number(curr.tagName.substring(1));

      if (currLevel > prevLevel + 1) {
        jumps.push({
          from: prev,
          to: curr,
          fromLevel: prevLevel,
          toLevel: currLevel
        });
      }
    }

    return {
      title: "Heading hierarchy jumps",
      status: jumps.length === 0 ? "pass" : "fail",
      content: jumps.length === 0
        ? "No heading hierarchy jumps found."
        : `
          <p><strong>${jumps.length}</strong> jump(s) in heading hierarchy found.</p>
          <ul>
            ${jumps.slice(0, 20).map((j, i) => `
              <li>
                <strong>${i + 1}. Sprung von &lt;h${j.fromLevel}&gt; zu &lt;h${j.toLevel}&gt;</strong><br>
                ${escapeHtml((j.from.textContent || "").trim() || "(ohne Text)")} 
                zu 
                ${escapeHtml((j.to.textContent || "").trim() || "(ohne Text)")}<br>
                In Position: <code>${escapeHtml(getDomPath(j.to))}</code>
              </li>
            `).join("")}
          </ul>
          ${jumps.length > 20 ? "<p>Only the first 20 are shown.</p>" : ""}
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

window.PageAnalyzerTests = tests;

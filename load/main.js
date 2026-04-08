// main.js

const tests = {
  headingsList() {
    const heads = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];

    return {
      title: "Headings list",
      status: heads.length === 0 ? "fail" : "pass",
      content: heads.length === 0
        ? "No headings found on the page."
        : `
          <p><strong>${heads.length}</strong> heading(s) found.</p>
          <ul>
            ${heads.map((el, i) => {
              const level = parseInt(el.tagName.substring(1), 10);
              const text = (el.textContent || "").trim() || "(no text)";
              const indent = (level - 1) * 16;

              return `
                <li style="margin-left:${indent}px">
                  <strong>&lt;h${level}&gt;</strong> ${escapeHtml(text)}
                </li>
              `;
            }).join("")}
          </ul>
        `
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
              <li>Image ${i + 1}: ${escapeHtml(img.outerHTML.slice(0, 200))} at ${getDomPath(img)}${img.hasAttribute('src') ? `<img src="${img.src}" height="80">` : ''}</li>
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
    const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")];
    const jumps = [];

    for (let i = 1; i < headings.length; i++) {
      const previous = headings[i - 1];
      const current = headings[i];

      const previousLevel = Number(previous.tagName.substring(1));
      const currentLevel = Number(current.tagName.substring(1));

      if (currentLevel > previousLevel + 1) {
        jumps.push({
          from: previous,
          to: current,
          fromLevel: previousLevel,
          toLevel: currentLevel
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
            ${jumps.slice(0, 20).map((jump, i) => `
              <li>
                <strong>${i + 1}. Sprung von &lt;h${jump.fromLevel}&gt; zu &lt;h${jump.toLevel}&gt;</strong><br>
                ${escapeHtml((jump.from.textContent || "").trim() || "(ohne Text)")} zu ${escapeHtml((jump.to.textContent || "").trim() || "(ohne Text)")}<br>
                In Position: <code>${escapeHtml(getDomPath(jump.to))}</code>
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

function getDomPath(el) {
  const parts = [];
  let current = el;
  let depth = 0;

  while (current && current.nodeType === 1 && depth < 6) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }

    if (current.classList && current.classList.length) {
      part += "." + [...current.classList].slice(0, 3).join(".");
    }

    const parent = current.parentElement;
    if (parent) {
      const sameTagSiblings = [...parent.children].filter(
        sibling => sibling.tagName === current.tagName
      );

      if (sameTagSiblings.length > 1) {
        part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
      }
    }

    parts.unshift(part);
    current = parent;
    depth++;
  }

  return parts.join(" > ");
};

window.PageAnalyzerTests = tests;

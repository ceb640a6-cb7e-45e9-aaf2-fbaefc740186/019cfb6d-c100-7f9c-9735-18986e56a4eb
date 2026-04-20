// main.js

const tests = {
  imagesMissingAlt() {
    const images = [...document.querySelectorAll("img")];
    const missingAlt = images.filter(img => !img.hasAttribute("alt"));

    return {
      id: 'R1012',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Bilder ohne Alt-Tag",
      status: missingAlt.length === 0 ? "pass" : "fail",
      content: missingAlt.length === 0
        ? "All images have an <code>alt</code> attribute."
        : `
          <p><strong>${missingAlt.length}</strong> image(s) are missing an <code>alt</code> attribute.</p>
          <ol>
            ${missingAlt.slice(0, 20).map((img, i) => `
              <li>Element: <code>${escapeHtml(img.outerHTML.slice(0, 200))}</code><br>
              Quelle: <a href="${escapeHtml(img.src)}" target="_blank">${escapeHtml(img.src.slice(0, 200))}</a><br>Position: <code>${getDomPath(img)}</code>${img.hasAttribute('src') ? `<br><img src="${img.src}" height="100">` : ''}</li>
            `).join("")}
          </ol>
          ${missingAlt.length > 20 ? "<p>Nur die ersten 20 Bilder werden gezeigt.</p>" : ""}
        `
    };
  },

  imagesEmptyAlt() {
    const images = [...document.querySelectorAll("img")];
    const emptyAltImages = images.filter(img => img.hasAttribute("alt") && img.getAttribute("alt").trim() === "");

    return {
      id: 'R1013',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Bilder mit leerem Alt-Tag",
      status: emptyAltImages.length === 0 ? "pass" : "check",
      content: emptyAltImages.length === 0
        ? "<p>Alle Alt-Texte in Bildern sind befüllt.</p>"
        : `
          <p><strong>${emptyAltImages.length}</strong> Bilder haben einen leeren <code>alt</code>-Tag und müssen <strong>manuell geprüft</strong> werden.</p>
          <ol>
            ${emptyAltImages.slice(0, 30).map((img, i) => `
              <li>${escapeHtml(img.outerHTML.slice(0, 200))}<br>Position: <code>${getDomPath(img)}</code>${img.hasAttribute('src') ? `<br><img src="${img.src}" height="100">` : ''}</li>
            `).join("")}
          </ol>
          ${emptyAltImages.length > 30 ? "<p>Nur die ersten 30 Bilder werden gezeigt.</p>" : ""}
        `
    };
  },

  linksWithoutText() {
    const links = [...document.querySelectorAll("a")];
    const badLinks = links.filter(a => !a.textContent.trim() && !a.getAttribute("aria-label"));

    return {
      id: 'R1244',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Links without text",
      status: badLinks.length === 0 ? "pass" : "fail",
      content: badLinks.length === 0
        ? "<p>No empty links found.</p>"
        : `
          <p><strong>${badLinks.length}</strong> link(s) appear to have no visible text and no <code>aria-label</code>.</p>
          <ol>
            ${badLinks.slice(0, 20).map(a => `
              <li>Element: <code>${escapeHtml(a.outerHTML.slice(0, 200))}</code><br>
              Link zu: <a href="${escapeHtml(a.href)}" target="_blank">${escapeHtml(a.href.slice(0, 200))}</a><br>
              Position: <code>${getDomPath(a)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(a)}</div>
              </details>
              </li>
            `).join("")}
          </ol>
        `
    };
  },

  oneH1() {
    const heads = [...document.querySelectorAll('h1')];
    return {
      id: 'R1031',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Only one H1",
      status: (heads.length === 1) ? "pass" : "fail",
      content: (heads.length === 1)
        ? `<p>Heading: <strong>${escapeHtml(document.querySelector('h1').textContent)}</strong></p>`
        : ((heads.length <= 0) ? "<p>This page has no heading h1.</p>" : `<p>This page has <strong>${heads.length}</strong> <code>h1</code> headings.</p>
        <ol>
        ${heads.map(el => `
          <li><strong>${el.textContent}</strong><br>
          Position: <code>${getDomPath(el)}</code>
          <details class="clone">
            <summary><p class="toggleText">Element anzeigen</p></summary>
            <div class="clonedElement">${cloneEl(el)}</div>
          </details>
          </li>
        `).join("")}
        </ol>
        `)
    };
  },

  checkHeadings() {
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

    let prevHLevel = +headings[0].tagName.substring(1);
    let headingList_content = (headings.length === 0)
        ? "<p>No headings found on the page.</p>"
        : `
          <p><strong>${headings.length}</strong> heading(s) found.</p>
          <ol>
            ${headings.map((el, i) => {
              const level = parseInt(el.tagName.substring(1), 10);
              const text = (el.textContent || "").trim() || "(no text)";
              const indent = (level - 1) * 16;
              const isJump = (level > (prevHLevel + 1));
              prevHLevel = level;

              return `
                <li style="margin-left:${indent}px" ${isJump ? 'class="highlight-temp"' : ''}>
                  <strong>&lt;h${level}&gt;</strong> ${escapeHtml(text)}
                </li>
              `;
            }).join("")}
          </ol>
        `;

    let headingJumps_content = (jumps.length === 0)
        ? "<p>No heading hierarchy jumps found.</p>"
        : `
          <p><strong>${jumps.length}</strong> jump(s) in heading hierarchy found.</p>
          <ol>
            ${jumps.slice(0, 20).map((jump, i) => `
              <li>
                <strong>Sprung von &lt;h${jump.fromLevel}&gt; zu &lt;h${jump.toLevel}&gt;</strong><br>
                <strong>"${escapeHtml((jump.from.textContent || "").trim() || "[ohne Text]")}"</strong> zu <strong>"${escapeHtml((jump.to.textContent || "").trim() || "[ohne Text]")}"</strong><br>
                In Position: <code>${escapeHtml(getDomPath(jump.to))}</code>
              </li>
            `).join("")}
          </ol>
          ${jumps.length > 20 ? "<p>Only the first 20 are shown.</p>" : ""}
        `

    return {
      id: 'R1031',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Heading hierarchy jumps",
      status: jumps.length === 0 ? (headings.length === 0 ? "check" : "pass") : "fail",
      content: `${headingJumps_content}
        <details>
          <summary><p class="toggleText">Alle ${headings.length} Überschriften anzeigen</code></p></summary>
          ${headingList_content}
        </details>
      `
    };
  },

  pruefeDokumenttitel() {
    const rawTitle = document.title || "";
    const titleText = rawTitle.trim();

    let score = 100;
    const fehler = [];
    const hinweise = [];

    const isEmpty = !titleText;
    const hasEmojiOrDecoration = /[★☆✓✔✕✖✗✘✦✧❖❤🔥✨🎉🚀💫🌟⚡\u{1F300}-\u{1FAFF}]/u.test(titleText);
    const hasManySpecials = /[!?.\-_=~*#|:;·•<>]{4,}/.test(titleText);
    const hasRepeatedSpaces = /\s{2,}/.test(titleText);
    const looksGeneric = /^(unbenannt|untitled|document|dokument|page|seite|home|homepage|index|app)$/i.test(titleText);
    const looksLikeFile = /^(https?:\/\/|www\.|index\.(html?|php)|default\.(html?|php))/i.test(titleText) || /\.(html?|php|pdf|xml|json|txt)$/i.test(titleText);
    const allCaps = /^[^a-zäöüß]*[A-ZÄÖÜ]{5,}[^a-zäöüß]*$/.test(titleText);
    const words = titleText.split(/\s+/).filter(Boolean);

    if (isEmpty) {
      return {
        id: 'R1242',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Dokumenttitel prüfen",
        status: "fail",
        content: "<p>Kein Dokumenttitel vorhanden.</p>"
      };
    }

    if (titleText.length < 5) {
      score -= 40;
      fehler.push("Titel ist sehr kurz.");
    }

    if (titleText.length > 80 && titleText.length <= 120) {
      score -= 10;
      hinweise.push("Titel ist relativ lang.");
    }

    if (titleText.length > 120) {
      score -= 25;
      fehler.push("Titel ist sehr lang.");
    }

    if (looksGeneric) {
      score -= 45;
      fehler.push("Titel ist zu generisch.");
    }

    if (looksLikeFile) {
      score -= 35;
      fehler.push("Titel wirkt wie eine URL oder Dateiname.");
    }

    if (hasEmojiOrDecoration) {
      score -= 10;
      hinweise.push("Titel enthält dekorative Zeichen oder Emojis.");
    }

    if (hasManySpecials) {
      score -= 15;
      hinweise.push("Titel enthält viele Sonderzeichen.");
    }

    if (hasRepeatedSpaces) {
      score -= 5;
      hinweise.push("Titel enthält Mehrfach-Leerzeichen.");
    }

    if (allCaps) {
      score -= 10;
      hinweise.push("Titel ist weitgehend in Großbuchstaben.");
    }

    if (words.length < 2 && titleText.length < 15) {
      score -= 10;
      hinweise.push("Titel könnte konkreter sein.");
    }

    score = Math.max(0, Math.min(100, score));

    let status = "pass";
    if (score < 50) {
      status = "fail";
    } else if (score < 85) {
      status = "check";
    }

    const parts = [`Gefundener Titel: "${titleText}".`, `Wertung: ${score}/100.`];
    if (fehler.length) { parts.push("Probleme: " + fehler.join(" ")); }
    if (hinweise.length) { parts.push("Hinweise: " + hinweise.join(" ")); }
    if (status === "pass") { parts.push("Der Titel wirkt sprechend, sinnvoll und sachlich formuliert."); }

    return {
      id: 'R1242',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Dokumenttitel prüfen",
      status,
      content: `<p>${parts.join("<br>")}</p>`
    };
  },

  checkIds() {
    const visible = (el) => {
      if (!el || !el.isConnected) return false;
      if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }

      if (!el.offsetParent && style.position !== "fixed") return false;

      return true;
    };

    const elementsWithId = Array.from(document.querySelectorAll("[id]")).filter(visible);

    const idMap = new Map();
    const emptyElements = [];

    elementsWithId.forEach((el) => {
      const id = el.getAttribute("id") || "";

      if (!id.trim()) {
        emptyElements.push(el);
        return;
      }

      if (!idMap.has(id)) {
        idMap.set(id, []);
      }

      idMap.get(id).push(el);
    });

    const duplicateIds = Array.from(idMap.entries())
      .filter(([, elements]) => elements.length > 1);

    const issueCount = duplicateIds.length + emptyElements.length;

    let status = "pass";
    if (issueCount > 0) status = "fail";

    let content = "<p>Keine Probleme mit IDs gefunden.</p>";

    if (issueCount > 0) {
      content = "";
      content += `<p>Doppelte IDs: <strong>${duplicateIds.length}</strong><br>
      Leere IDs: <strong>${emptyElements.length}</strong></p>`;

      if (duplicateIds.length > 0) {
        content += duplicateIds.map(([key, elements]) => {
          return `
            <details class="clone">
              <summary><p class="toggleText">Elemente anzeigen mit <code>#${key}</code></p></summary>
              ${elements.map(el => `
                <div class="clonedElement">${cloneEl(el)}</div>
              `).join("")}
            </details>
          `;
        }).join("");
      }

      if (emptyElements.length > 0) {
        content += `
          <details class="clone">
            <summary><p class="toggleText">Elemente anzeigen mit leerer ID</p></summary>
            ${emptyElements.map(el => `
              <div class="clonedElement">${cloneEl(el)}</div>
            `).join("")}
          </details>
        `;
      }
    }

    return {
      id: 'R1411',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Prüfe IDs",
      status,
      content
    };
  },

  checkDuplicateAttributes() {
    const visible = (el) => {
      if (!el || !el.isConnected) return false;
      if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }

      if (!el.offsetParent && style.position !== "fixed") return false;

      return true;
    };

    const allVisibleElements = Array.from(document.querySelectorAll("*")).filter(visible);
    const affectedElements = [];

    allVisibleElements.forEach((el) => {
      const names = Array.from(el.attributes).map((attr) => attr.name.toLowerCase());
      const counts = new Map();

      names.forEach((name) => {
        counts.set(name, (counts.get(name) || 0) + 1);
      });

      const duplicates = Array.from(counts.entries()).filter(([, count]) => count > 1);

      if (duplicates.length > 0) {
        affectedElements.push(el);
      }
    });

    let status = "pass";
    if (affectedElements.length > 0) status = "fail";

    let content = "<p>Keine doppelten Attribute gefunden.</p>";

    if (affectedElements.length > 0) {
      content = `<p>Elemente mit doppelten Attributen gefunden: ${affectedElements.length}.</p>`;
    }

    return {
      id: 'R1411',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Doppelte Attribute",
      status,
      content
    };
  },

  textFromCSS() {
    const normalizeContent = (value) => {
      try {
        value = String(value);
      } catch {
        return "";
      }

      if (value === "none" || value === '""' || value === "''") {
        return "";
      }

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      return value.trim();
    };

    const results = [];

    document.querySelectorAll("*").forEach((el) => {
      let before = "";
      let after = "";

      try {
        before = normalizeContent(getComputedStyle(el, "::before").content);
      } catch {}

      try {
        after = normalizeContent(getComputedStyle(el, "::after").content);
      } catch {}

      const matches = [];

      if (before.length > 2) {
        matches.push(`::before = "${before}"`);
      }

      if (after.length > 2) {
        matches.push(`::after = "${after}"`);
      }

      if (matches.length > 0) {
        let selector = (el.tagName || "").toLowerCase();

        if (el.id) {
          selector += `#${el.id}`;
        }

        if (el.classList && el.classList.length) {
          selector += `.${Array.from(el.classList).slice(0, 4).join(".")}`;
        }

        results.push(`<strong>${selector || "(node)"}</strong><br>${matches.join(" | ")}<br>Position: <code>${getDomPath(el)}</code>`);
      }
    });

    if (results.length === 0) {
      return {
        id: 'R1034',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "CSS-Text in Pseudo-Elementen",
        status: "pass",
        content: '<p>Kein per CSS eingebundener Text über "::before" oder "::after" mit mehr als 2 Zeichen gefunden.</p>'
      };
    }

    return {
      id: 'R1034',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "CSS-Text in Pseudo-Elementen",
      status: "fail",
      content:
        `<p>Es wurden ${results.length} Element(e) mit per CSS eingebundenem Text gefunden:</p>
        <ol>
          <li>
          ${results.join("</li><li>")}
          </li>
        </ol>`
    };
  },

  checkLandmarks() {
    const LANDMARKS = ["header", "nav", "main", "aside", "footer"];

    function isVisible(el) {
      if (!el) return false;

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        el.hidden ||
        el.getAttribute("aria-hidden") === "true"
      ) {
        return false;
      }

      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function isPageLevelHeaderOrFooter(el) {
      if (!el || !el.parentElement) return true;
      return !el.closest("article, aside, main, nav, section");
    }

    function getRelevantElements(tagName) {
      const elements = Array.from(document.querySelectorAll(tagName));

      if (tagName === "header" || tagName === "footer") {
        return elements.filter(isPageLevelHeaderOrFooter);
      }

      return elements;
    }

    function getAccessibleName(el) {
      const ariaLabel = el.getAttribute("aria-label");
      if (ariaLabel && ariaLabel.trim()) {
        return ariaLabel.trim();
      }

      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id))
          .filter(Boolean)
          .map((node) => (node.textContent || "").trim())
          .filter(Boolean)
          .join(" ");
        if (text) return text;
      }

      return "";
    }

    const details = LANDMARKS.map((tag) => {
      const elements = getRelevantElements(tag);
      const visibleElements = elements.filter(isVisible);

      return {
        tag,
        count: elements.length,
        visibleCount: visibleElements.length,
        namedCount:
          tag === "nav" || tag === "aside"
            ? visibleElements.filter((el) => getAccessibleName(el)).length
            : null
      };
    });

    let status = "pass";
    const messages = [];

    const main = details.find((item) => item.tag === "main");
    const nav = details.find((item) => item.tag === "nav");
    const header = details.find((item) => item.tag === "header");
    const footer = details.find((item) => item.tag === "footer");

    if (!main || main.count === 0) {
      status = "fail";
      messages.push("Kein <code>main</code> gefunden.");
    } else if (main.count > 1) {
      status = "fail";
      messages.push(`Mehrere <code>main</code>-Elemente gefunden (${main.count}).`);
    } else if (main.visibleCount === 0) {
      status = "fail";
      messages.push("<code>main</code> ist vorhanden, aber nicht sichtbar.");
    }

    if (!nav || nav.count === 0) {
      status = "fail";
      messages.push("Kein <code>nav</code> gefunden.");
    } else if (nav.visibleCount === 0) {
      status = "fail";
      messages.push("<code>nav</code> ist vorhanden, aber nicht sichtbar.");
    }

    if (status !== "fail") {
      const presentCount = details.filter((item) => item.count > 0).length;

      if (presentCount < 3) {
        status = "check";
        messages.push(
          `Nur ${presentCount} von 5 geprüften Landmarken wurden gefunden.`
        );
      }

      if (header && header.count === 0) {
        if (status === "pass") status = "check";
        messages.push("Kein seitenweiter <code>header</code> gefunden.");
      }

      if (footer && footer.count === 0) {
        if (status === "pass") status = "check";
        messages.push("Kein seitenweiter <code>footer</code> gefunden.");
      }

      if (nav && nav.visibleCount > 1 && nav.namedCount < nav.visibleCount) {
        if (status === "pass") status = "check";
        messages.push(
          "Mehrere sichtbare <code>nav</code>-Bereiche sind nicht eindeutig benannt."
        );
      }
    }

    /*if (messages.length === 0) {
      messages.push("Die geprüften Landmarken wurden in sinnvoller Form gefunden.");
    }*/

    const summaryList = details
      .map((item) => {
        const label = `<code>${escapeHtml(item.tag)}</code>`;
        const base = `${label}: gefunden <b>${item.count}</b>, sichtbar <b>${item.visibleCount}</b>`;
        if (item.namedCount !== null && item.visibleCount > 1) {
          return `${base}, benannt <b>${item.namedCount}</b>`;
        }
        return base;
      })
      .join("<br>");

      const noIssues = (messages.length === 0);
      let msgOutput = "<p>Die geprüften Landmarken wurden in sinnvoller Form gefunden.</p>";
      let msgOutHead = 'Keine Probleme';
      if (status === "check") msgOutHead = 'Anmerkungen';
      if (status === "fail") msgOutHead = 'Probleme';
      if (!noIssues) {
        msgOutput = `<ul>${messages.map((msg) => `<li>${msg}</li>`).join("")}</ul>`;
      }

      return {
      id: 'R1241',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Landmarken",
      status,
      content: `
        <p>${summaryList}</p>${msgOutput}
      `
    };
  },

  pruefeSichtbareTabellen() {
    function localTableElements(table, selector) {
      return Array.from(table.querySelectorAll(selector)).filter((el) => el.closest("table") === table);
    }

    function getAlpha(color) {
      if (!color) return 0;

      const value = String(color).trim().toLowerCase();

      if (value === "transparent") return 0;

      let match = value.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)$/);
      if (match) return parseFloat(match[1]);

      if (/^rgb\(/.test(value)) return 1;

      match = value.match(/^hsla\(\s*[-0-9.]+\s*,\s*[-0-9.]+%\s*,\s*[-0-9.]+%\s*,\s*([0-9.]+)\s*\)$/);
      if (match) return parseFloat(match[1]);

      if (/^hsl\(/.test(value)) return 1;

      if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
        if (value.length === 5) return parseInt(value[4] + value[4], 16) / 255;
        if (value.length === 9) return parseInt(value.slice(7, 9), 16) / 255;
        return 1;
      }

      return 1;
    }

    function hasVisibleBackground(el) {
      try {
        return getAlpha(getComputedStyle(el).backgroundColor) > 0;
      } catch {
        return false;
      }
    }

    function hasVisibleBorder(el) {
      try {
        const cs = getComputedStyle(el);
        const sides = ["Top", "Right", "Bottom", "Left"];

        return sides.some((side) => {
          const style = cs["border" + side + "Style"];
          const width = parseFloat(cs["border" + side + "Width"]) || 0;
          const color = cs["border" + side + "Color"];

          return style !== "none" && style !== "hidden" && width > 0 && getAlpha(color) > 0;
        });
      } catch {
        return false;
      }
    }

    function hasVisibleTableStyling(table) {
      const relevantElements = [
        table,
        ...localTableElements(table, "caption,thead,tbody,tfoot,tr,th,td")
      ];

      return relevantElements.some((el) => hasVisibleBackground(el) || hasVisibleBorder(el));
    }

    function nearestContext(el) {
      return el.closest("table,section,article,main,aside,div") || el.parentElement || el;
    }

    const issues = [];
    const tables = Array.from(document.querySelectorAll("table"));
    const visibleTables = tables.filter(hasVisibleTableStyling);

    visibleTables.forEach((table) => {
      const errors = [];

      const trs = localTableElements(table, "tr");
      const ths = localTableElements(table, "th");
      const tds = localTableElements(table, "td");

      if (!trs.length) errors.push("Keine <tr> vorhanden");
      if (!ths.length) errors.push("Keine <th> vorhanden");
      if (!tds.length) errors.push("Keine <td> vorhanden");

      Array.from(table.children).forEach((child) => {
        if (!/^(caption|colgroup|thead|tbody|tfoot|tr|script|template|style)$/i.test(child.tagName)) {
          errors.push(`<table> enthält ungültiges direktes Kindelement: <${child.tagName.toLowerCase()}>`);
        }
      });

      localTableElements(table, "tr").forEach((tr) => {
        const parent = tr.parentElement;
        const validParent = parent && /^(table|thead|tbody|tfoot)$/i.test(parent.tagName);

        if (!validParent) {
          errors.push("<tr> ist falsch verschachtelt (direktes Elternelement muss <table>, <thead>, <tbody> oder <tfoot> sein)");
        }

        const invalidChildren = Array.from(tr.children).filter((child) => {
          return !/^(td|th|script|template|style)$/i.test(child.tagName);
        });

        if (invalidChildren.length) {
          errors.push(
            `<tr> enthält ungültige direkte Kindelemente: ${invalidChildren
              .map((el) => `<${el.tagName.toLowerCase()}>`)
              .join(", ")}`
          );
        }

        const directCells = Array.from(tr.children).filter((child) => /^(td|th)$/i.test(child.tagName));

        if (!directCells.length) {
          errors.push("<tr> enthält keine direkten <td> oder <th> Elemente");
        }
      });

      localTableElements(table, "th,td").forEach((cell) => {
        const parent = cell.parentElement;

        if (!parent || parent.tagName.toLowerCase() !== "tr") {
          errors.push(`<${cell.tagName.toLowerCase()}> ist kein direktes Kind eines <tr>`);
        }

        const tr = cell.closest("tr");
        if (!tr || tr.closest("table") !== table) {
          errors.push(`<${cell.tagName.toLowerCase()}> ist falsch verschachtelt (nicht innerhalb eines <tr> dieser Tabelle)`);
        }
      });

      const uniqueErrors = [...new Set(errors)];

      if (uniqueErrors.length) {
        issues.push({
          label: getSelector(table),
          path: getDomPath(table),
          errors: uniqueErrors
        });
      }
    });

    const orphanIssuesRaw = [];

    Array.from(document.querySelectorAll("tr,th,td")).forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const table = el.closest("table");

      if (!table) {
        let msg = "";

        if (tag === "tr") msg = "<tr> ist kein Kind eines <table>-Kontexts";
        if (tag === "th") msg = "<th> ist nicht innerhalb einer Tabelle verschachtelt";
        if (tag === "td") msg = "<td> ist nicht innerhalb einer Tabelle verschachtelt";

        orphanIssuesRaw.push({
          context: nearestContext(el),
          label: getSelector(el),
          path: getDomPath(el),
          message: msg
        });

        return;
      }

      if (tag === "tr") {
        const parent = el.parentElement;
        if (!parent || !/^(table|thead|tbody|tfoot)$/i.test(parent.tagName)) {
          orphanIssuesRaw.push({
            context: table,
            label: getSelector(el),
            path: getDomPath(el),
            message: "<tr> ist nicht direkt in <table>, <thead>, <tbody> oder <tfoot> verschachtelt"
          });
        }
      }

      if (tag === "th" || tag === "td") {
        const parent = el.parentElement;
        if (!parent || parent.tagName.toLowerCase() !== "tr") {
          orphanIssuesRaw.push({
            context: table,
            label: getSelector(el),
            path: getDomPath(el),
            message: `<${tag}> ist kein direktes Kind eines <tr>`
          });
        }
      }
    });

    const orphanMap = new Map();

    orphanIssuesRaw.forEach((item) => {
      const key = getDomPath(item.context);

      if (!orphanMap.has(key)) {
        orphanMap.set(key, {
          label: getSelector(item.context),
          path: getDomPath(item.context),
          errors: []
        });
      }

      orphanMap.get(key).errors.push(`${item.label}: ${item.message}`);
    });

    for (const entry of orphanMap.values()) {
      entry.errors = [...new Set(entry.errors)];
      issues.push(entry);
    }

    if (!issues.length) {
      return {
        id: 'R1035',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Struktur sichtbarer Tabellen prüfen",
        status: "pass",
        content: visibleTables.length
          ? `<p>Alle ${visibleTables.length} visuell gestalteten Tabellen sind korrekt aufgebaut und verschachtelt.</p>`
          : "<p>Keine visuell gestalteten Tabellen gefunden.</p>"
      };
    }

    const html = `
      <p>Geprüfte visuell gestaltete Tabellen: <b>${visibleTables.length}</b><br>
      Gefundene Probleme: <b>${issues.length}</b></p><ol>
        ${issues
          .map(
            (item, index) => `
              <li>
                <b>${escapeHtml(item.label)}</b><br>
                ${item.errors
                .map(
                  (err) => `${escapeHtml(err)}`
                )
                .join("<br>")}<br>
                Pfad: <code>${escapeHtml(item.path)}</code>
              </li>
            `
          )
        .join("")}</ol>
    `;

    return {
      id: 'R1035',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Struktur sichtbarer Tabellen prüfen",
      status: "fail",
      content: html
    };
  },

  pruefeTransparenteTabellen() {
    function localTableElements(table, selector) {
      return Array.from(table.querySelectorAll(selector)).filter((el) => el.closest("table") === table);
    }

    function getAlpha(color) {
      if (!color) return 0;

      const value = String(color).trim().toLowerCase();

      if (value === "transparent") return 0;

      let match = value.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)$/);
      if (match) return parseFloat(match[1]);

      if (/^rgb\(/.test(value)) return 1;

      match = value.match(/^hsla\(\s*[-0-9.]+\s*,\s*[-0-9.]+%\s*,\s*[-0-9.]+%\s*,\s*([0-9.]+)\s*\)$/);
      if (match) return parseFloat(match[1]);

      if (/^hsl\(/.test(value)) return 1;

      if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
        if (value.length === 5) return parseInt(value[4] + value[4], 16) / 255;
        if (value.length === 9) return parseInt(value.slice(7, 9), 16) / 255;
        return 1;
      }

      return 1;
    }

    function hasVisibleBackground(el) {
      try {
        return getAlpha(getComputedStyle(el).backgroundColor) > 0;
      } catch {
        return false;
      }
    }

    function hasVisibleBorder(el) {
      try {
        const cs = getComputedStyle(el);
        const sides = ["Top", "Right", "Bottom", "Left"];

        return sides.some((side) => {
          const style = cs["border" + side + "Style"];
          const width = parseFloat(cs["border" + side + "Width"]) || 0;
          const color = cs["border" + side + "Color"];

          return style !== "none" && style !== "hidden" && width > 0 && getAlpha(color) > 0;
        });
      } catch {
        return false;
      }
    }

    function hasVisibleTableStyling(table) {
      const relevantElements = [
        table,
        ...localTableElements(table, "caption,thead,tbody,tfoot,tr,th,td")
      ];

      return relevantElements.some((el) => hasVisibleBackground(el) || hasVisibleBorder(el));
    }

    const tables = Array.from(document.querySelectorAll("table"));
    const transparentTables = tables.filter((table) => !hasVisibleTableStyling(table));
    const issues = [];

    transparentTables.forEach((table) => {
      const errors = [];

      if (localTableElements(table, "th").length) {
        errors.push('Transparente Tabelle darf kein <th> besitzen');
      }

      if (localTableElements(table, "caption").length) {
        errors.push('Transparente Tabelle darf kein <caption> besitzen');
      }

      if (table.hasAttribute("summary")) {
        errors.push('Transparente Tabelle darf kein Attribut "summary" besitzen');
      }

      const headersElements = localTableElements(table, "[headers]");
      if (headersElements.length) {
        errors.push(
          `Transparente Tabelle darf kein Attribut "headers" besitzen (${headersElements
            .map((el) => getSelector(el))
            .join(", ")})`
        );
      }

      const idElements = [table, ...localTableElements(table, "[id]")].filter(
        (el, index, arr) => arr.indexOf(el) === index && el.hasAttribute("id")
      );

      if (idElements.length) {
        errors.push(
          `Transparente Tabelle darf kein Attribut "id" besitzen (${idElements
            .map((el) => getSelector(el))
            .join(", ")})`
        );
      }

      if (errors.length) {
        issues.push({
          label: getSelector(table),
          path: getDomPath(table),
          errors: [...new Set(errors)]
        });
      }
    });

    if (!issues.length) {
      return {
        id: 'R1037',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Visuell transparente Tabellen prüfen",
        status: "pass",
        content: transparentTables.length
          ? `<p>Keine verbotenen Elemente oder Attribute in ${transparentTables.length} visuell transparenten Tabellen gefunden.</p>`
          : "<p>Keine visuell transparenten Tabellen gefunden.</p>"
      };
    }

    const html = `
      <p>Geprüfte visuell transparente Tabellen: <b>${transparentTables.length}</b><br>
      Gefundene Probleme: <b>${issues.length}</b></p><ol>
        ${issues
          .map(
            (item, index) => `
              <li>
                <b>${escapeHtml(item.label)}</b><br>
                ${item.errors
                .map(
                  (err) => `${escapeHtml(err)}`
                )
                .join("<br>")}<br>
                Pfad: <code>${escapeHtml(item.path)}</code>
              </li>
            `
          )
        .join("")}</ol>
    `;

    return {
      id: 'R1037',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Visuell transparente Tabellen prüfen",
      status: "fail",
      content: html
    };
  },

  pruefeLangAttribut() {
    const htmlEl = document.documentElement;
    const hasLang = htmlEl && htmlEl.hasAttribute("lang");
    const langValue = hasLang ? String(htmlEl.getAttribute("lang") || "").trim() : "";

    let status = "pass";
    let content = "<p>Das <code>&lt;html&gt;</code>-Element hat ein gesetztes und nicht-leeres <code>lang</code>-Attribut.</p>";

    if (!htmlEl) {
      status = "fail";
      content = "<p>Es konnte kein <code>&lt;html&gt;</code>-Element gefunden werden.</p>";
    } else if (!hasLang) {
      status = "fail";
      content = `<p>Attribut <code>lang</code> fehlt für das <code>&lt;html&gt;</code>-Element.<br>${getElTag(htmlEl)}</p>`;
    } else if (!langValue) {
      status = "fail";
      content = `<p>Das <code>&lt;html&gt;</code>-Element hat ein leeres <code>lang</code>-Attribut.<br>${getElTag(htmlEl)}</p>`;
    }

    return {
      id: 'R1311',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "lang-Attribut prüfen",
      status,
      content
    };
  },

  findeKomplettLeereTags() {
    const VOID_TAGS = new Set([
      "AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT",
      "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"
    ]);

    const alleElemente = Array.from(document.querySelectorAll("*"));

    function hatSichtbarenText(el) {
      return Array.from(el.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
      );
    }

    const leereElemente = alleElemente.filter((el) => {
      if (VOID_TAGS.has(el.tagName)) return false;
      if (el.attributes.length > 0) return false;
      if (el.children.length > 0) return false;
      if (hatSichtbarenText(el)) return false;

      return true;
    });

    if (leereElemente.length === 0) {
      return {
        id: 'R8010',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Leere Tags ohne Attribute",
        status: "pass",
        content: `<p>Es wurden keine leeren Tags ohne Attribute gefunden.</p>`
      };
    }

    const gruppiertNachTag = leereElemente.reduce((acc, el) => {
      const tag = el.tagName.toLowerCase();
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(el);
      return acc;
    }, {});

    const sortierteTags = Object.keys(gruppiertNachTag).sort(
      (a, b) => gruppiertNachTag[b].length - gruppiertNachTag[a].length
    );

    const detailsHtml = sortierteTags
      .map((tag) => {
        const elemente = gruppiertNachTag[tag];
        const eintraege = elemente
          .map((el) => {
            return `
              <li>
                <strong>${getElTag(el)}</strong>
                Element: <code>${escapeHtml(el.outerHTML)}</code><br>
                Position: <code>${escapeHtml(getDomPath(el))}</code>
              </li>
            `;
          })
          .join("");

        return `
          <div style="margin-bottom:12px;">
            <ol style="margin-top:6px;">
              ${eintraege}
            </ol>
          </div>
        `;
      })
      .join("");

    return {
      id: 'R8010',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Leere Tags ohne Attribute",
      status: "check",
      content: `
        <p>Es wurden <b>${leereElemente.length}</b> leere Tags ohne Attribute gefunden.</p>
        <div class="sub" style="margin-top:8px;">
          <p>Geprüft wurden nur Elemente ohne Attribute, ohne Textinhalt und ohne Kindelemente.<br>
          Void-Elemente wie <code>&lt;br&gt;</code>, <code>&lt;hr&gt;</code> oder <code>&lt;meta&gt;</code> wurden ignoriert.</p>
        </div>
        <div style="margin-top:12px;">
          ${detailsHtml}
        </div>
      `
    };
  },

  pruefeLinksImFliesstext() {
    const textOf = el => (el && el.textContent || "").replace(/\s+/g, " ").trim();

    const isVisible = el => {
      if (!el || !el.isConnected) return false;
      const cs = getComputedStyle(el);
      if (
        cs.display === "none" ||
        cs.visibility === "hidden" ||
        cs.visibility === "collapse" ||
        parseFloat(cs.opacity) === 0
      ) {
        return false;
      }
      const r = el.getBoundingClientRect();
      return !!(r.width || r.height);
    };

    const parseColor = str => {
      if (!str) return null;
      const m = String(str).match(/rgba?\(([^)]+)\)/i);
      if (!m) return null;
      const parts = m[1].split(",").map(x => parseFloat(x.trim()));
      if (parts.length < 3 || parts.some(n => Number.isNaN(n))) return null;
      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        a: parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1
      };
    };

    const colorToStr = c => {
      if (!c) return "unbekannt";
      return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${typeof c.a === "number" ? +c.a.toFixed(2) : 1})`;
    };

    const srgb = v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const relLum = c => {
      if (!c) return null;
      return 0.2126 * srgb(c.r) + 0.7152 * srgb(c.g) + 0.0722 * srgb(c.b);
    };

    const contrast = (c1, c2) => {
      const l1 = relLum(c1);
      const l2 = relLum(c2);
      if (l1 == null || l2 == null) return null;
      const hi = Math.max(l1, l2);
      const lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    };

    const sameColor = (a, b) => {
      if (!a || !b) return false;
      return (
        Math.round(a.r) === Math.round(b.r) &&
        Math.round(a.g) === Math.round(b.g) &&
        Math.round(a.b) === Math.round(b.b) &&
        Math.abs((a.a ?? 1) - (b.a ?? 1)) < 0.02
      );
    };

    const px = n => Number.parseFloat(String(n || "").replace("px", "")) || 0;

    const normTextDec = cs => {
      const line = (cs.textDecorationLine || "").toLowerCase().trim();
      const style = (cs.textDecorationStyle || "").toLowerCase().trim();
      const thick = (cs.textDecorationThickness || "").toLowerCase().trim();
      return `${line}|${style}|${thick}`;
    };

    const hasVisibleBg = cs => {
      const c = parseColor(cs.backgroundColor);
      return !!(c && c.a > 0 && !(c.r === 0 && c.g === 0 && c.b === 0 && c.a === 0));
    };

    const hasVisibleBorderBottom = cs => {
      return (
        px(cs.borderBottomWidth) > 0 &&
        (cs.borderBottomStyle || "none") !== "none" &&
        !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(cs.borderBottomColor || "")
      );
    };

    const hasVisibleOutline = cs => {
      return px(cs.outlineWidth) > 0 && (cs.outlineStyle || "none") !== "none";
    };

    const hasVisibleShadow = cs => {
      return (cs.boxShadow || "none") !== "none" || (cs.textShadow || "none") !== "none";
    };

    const fontWeightNum = v => {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) return n;
      const s = String(v || "").toLowerCase();
      if (s === "normal") return 400;
      if (s === "bold") return 700;
      return 400;
    };

    const isPotentialTextContainer = el => {
      if (!el || el.nodeType !== 1) return false;
      const tag = (el.tagName || "").toLowerCase();
      return /^(p|li|dd|dt|td|th|blockquote|figcaption|caption|article|section|main|div|span)$/i.test(tag);
    };

    const closestTextContainer = el => {
      let cur = el.parentElement;
      while (cur && cur !== document.body) {
        if (isPotentialTextContainer(cur)) return cur;
        cur = cur.parentElement;
      }
      return el.parentElement || document.body;
    };

    const hasBlockChild = el => {
      return Array.from(el.children || []).some(ch => {
        const d = getComputedStyle(ch).display;
        return ["block", "flex", "grid", "table", "list-item"].includes(d);
      });
    };

    const hasSiblingTextAround = el => {
      const p = el.parentNode;
      if (!p) return false;
      const nodes = Array.from(p.childNodes);
      const idx = nodes.indexOf(el);
      const isTextNodeWithContent = n =>
        n &&
        n.nodeType === 3 &&
        (n.textContent || "").replace(/\s+/g, " ").trim().length > 0;

      for (let i = idx - 1; i >= 0; i--) {
        if (isTextNodeWithContent(nodes[i])) return true;
      }
      for (let i = idx + 1; i < nodes.length; i++) {
        if (isTextNodeWithContent(nodes[i])) return true;
      }
      return false;
    };

    const looksLikeInlineTextLink = a => {
      if (!a || a.tagName.toLowerCase() !== "a") return false;
      if (!isVisible(a)) return false;

      const txt = textOf(a);
      if (!txt || txt.length < 2) return false;

      if (a.closest("nav, header, footer, .breadcrumb, [aria-label*='breadcrumb' i]")) return false;
      if (hasBlockChild(a)) return false;

      const cs = getComputedStyle(a);
      if (["button", "inline-flex", "flex", "grid", "table", "block"].includes(cs.display)) return false;

      if (a.querySelector("img,button,input,select,textarea")) return false;

      const container = closestTextContainer(a);
      const containerText = textOf(container);

      if (containerText.length < txt.length + 10) return false;
      if (!hasSiblingTextAround(a) && !(containerText.replace(txt, "").trim().length > 10)) return false;

      return true;
    };

    const analyzeLink = a => {
      const linkCs = getComputedStyle(a);
      const ctx = closestTextContainer(a);
      const ctxCs = getComputedStyle(ctx);

      const linkColor = parseColor(linkCs.color);
      const ctxColor = parseColor(ctxCs.color);

      const cues = [];

      const linkDec = normTextDec(linkCs);
      const ctxDec = normTextDec(ctxCs);

      const linkHasUnderline = (linkCs.textDecorationLine || "").toLowerCase().includes("underline");
      const ctxHasUnderline = (ctxCs.textDecorationLine || "").toLowerCase().includes("underline");

      if (linkHasUnderline && !ctxHasUnderline) cues.push("Unterstreichung");

      const fwLink = fontWeightNum(linkCs.fontWeight);
      const fwCtx = fontWeightNum(ctxCs.fontWeight);
      if (Math.abs(fwLink - fwCtx) >= 150) cues.push(`andere Schriftstärke (${fwCtx} → ${fwLink})`);

      if ((linkCs.fontStyle || "normal") !== (ctxCs.fontStyle || "normal")) {
        cues.push(`anderer Schriftstil (${ctxCs.fontStyle} → ${linkCs.fontStyle})`);
      }

      if ((linkCs.fontFamily || "").split(",")[0] !== (ctxCs.fontFamily || "").split(",")[0]) {
        cues.push("andere Schriftfamilie");
      }

      if (Math.abs(px(linkCs.fontSize) - px(ctxCs.fontSize)) >= 1) {
        cues.push(`andere Schriftgröße (${ctxCs.fontSize} → ${linkCs.fontSize})`);
      }

      if (hasVisibleBg(linkCs) && !sameColor(parseColor(linkCs.backgroundColor), parseColor(ctxCs.backgroundColor))) {
        cues.push("Hintergrund hervorgehoben");
      }

      if (hasVisibleBorderBottom(linkCs) && !hasVisibleBorderBottom(ctxCs)) {
        cues.push("sichtbare Unterkante/Border");
      }

      if (hasVisibleOutline(linkCs) && !hasVisibleOutline(ctxCs)) {
        cues.push("sichtbarer Outline");
      }

      if (hasVisibleShadow(linkCs) && !hasVisibleShadow(ctxCs)) {
        cues.push("sichtbarer Schatten");
      }

      if (linkDec !== ctxDec && !cues.includes("Unterstreichung")) {
        cues.push("abweichende Textdekoration");
      }

      const colorDiff = !sameColor(linkColor, ctxColor);
      const linkVsTextContrast = contrast(linkColor, ctxColor);

      let status = "pass";
      let reason = "";

      if (!colorDiff && cues.length === 0) {
        status = "fail";
        reason = "Kein klarer stilistischer Unterschied zum umgebenden Text gefunden.";
      } else if (colorDiff && cues.length === 0) {
        status = "fail";
        reason = `Link unterscheidet sich nur über Farbe vom umgebenden Text${linkVsTextContrast != null ? ` (Farbkontrast Link/Text: ${linkVsTextContrast.toFixed(2)}:1)` : ""}.`;
      } else {
        status = "pass";
        reason = `Zusätzliche visuelle Unterscheidung gefunden: ${cues.join(", ")}.`;
      }

      const diff = {
        color: {
          link: linkCs.color || "",
          context: ctxCs.color || ""
        },
        textDecoration: {
          link: linkCs.textDecorationLine || "",
          context: ctxCs.textDecorationLine || ""
        },
        textDecorationStyle: {
          link: linkCs.textDecorationStyle || "",
          context: ctxCs.textDecorationStyle || ""
        },
        textDecorationThickness: {
          link: linkCs.textDecorationThickness || "",
          context: ctxCs.textDecorationThickness || ""
        },
        fontWeight: {
          link: linkCs.fontWeight || "",
          context: ctxCs.fontWeight || ""
        },
        fontStyle: {
          link: linkCs.fontStyle || "",
          context: ctxCs.fontStyle || ""
        },
        fontSize: {
          link: linkCs.fontSize || "",
          context: ctxCs.fontSize || ""
        },
        fontFamily: {
          link: linkCs.fontFamily || "",
          context: ctxCs.fontFamily || ""
        },
        backgroundColor:
          hasVisibleBg(linkCs) || hasVisibleBg(ctxCs)
            ? {
                link: linkCs.backgroundColor || "",
                context: ctxCs.backgroundColor || ""
              }
            : null,
        borderBottom:
          hasVisibleBorderBottom(linkCs) || hasVisibleBorderBottom(ctxCs)
            ? {
                link: `${linkCs.borderBottomWidth} ${linkCs.borderBottomStyle} ${linkCs.borderBottomColor}`,
                context: `${ctxCs.borderBottomWidth} ${ctxCs.borderBottomStyle} ${ctxCs.borderBottomColor}`
              }
            : null,
        outline:
          hasVisibleOutline(linkCs) || hasVisibleOutline(ctxCs)
            ? {
                link: `${linkCs.outlineWidth} ${linkCs.outlineStyle} ${linkCs.outlineColor}`,
                context: `${ctxCs.outlineWidth} ${ctxCs.outlineStyle} ${ctxCs.outlineColor}`
              }
            : null,
        textShadow:
          (linkCs.textShadow || "none") !== "none" || (ctxCs.textShadow || "none") !== "none"
            ? {
                link: linkCs.textShadow || "",
                context: ctxCs.textShadow || ""
              }
            : null,
        boxShadow:
          (linkCs.boxShadow || "none") !== "none" || (ctxCs.boxShadow || "none") !== "none"
            ? {
                link: linkCs.boxShadow || "",
                context: ctxCs.boxShadow || ""
              }
            : null
      };

      return {
        el: a,
        text: textOf(a) || "(ohne Text)",
        path: getDomPath(a),
        status,
        reason,
        colorDiff,
        linkColor: colorToStr(linkColor),
        ctxColor: colorToStr(ctxColor),
        contrast: linkVsTextContrast,
        diff
      };
    };

    const renderDiffs = x => {
      const labels = {
        color: "Farbe",
        textDecoration: "Text Decoration",
        textDecorationStyle: "Text Decoration Style",
        textDecorationThickness: "Text Decoration Thickness",
        fontWeight: "Font Weight",
        fontStyle: "Font Style",
        fontSize: "Font Size",
        fontFamily: "Font Family",
        backgroundColor: "Hintergrund",
        borderBottom: "Border Bottom",
        outline: "Outline",
        textShadow: "Text Shadow",
        boxShadow: "Box Shadow"
      };

      let rows = Object.entries(x.diff)
      .filter(([, v]) => v && String(v.link) !== String(v.context))
      .map(([key, v]) => `
          <b>${escapeHtml(labels[key] || key)}:</b>
          Text = <code>${escapeHtml(v.context || "(leer)")}</code>
          → Link = <code>${escapeHtml(v.link || "(leer)")}</code>
      `)
      .join("<br>");

      let returnRows = false;
      if (rows) returnRows = true;
      rows = `<p>${rows}</p>`;
      return (returnRows ? rows : '');
    };

    const renderItem = (x, i) => {
      return `
        <li>
          <strong>${escapeHtml(x.text)}</strong><br>
          ${escapeHtml(x.reason)}<br>
          Link-Farbe: <code>${escapeHtml(x.linkColor)}</code> →
          Umgebender Text: <code>${escapeHtml(x.ctxColor)}</code>
          ${x.contrast != null ? ` → Kontrast Link/Text: <b>${escapeHtml(x.contrast.toFixed(2))}:1</b>` : ""}<br>
          Position: <code>${escapeHtml(x.path)}</code>
          ${renderDiffs(x)}

          <details class="clone">
            <summary><p class="toggleText">Element anzeigen</code></p></summary>
            <div class="clonedElement">${cloneEl(x.el)}</div>
          </details>
        </li>
      `;
    };

    const allLinks = Array.from(document.querySelectorAll("a[href]"));
    const inlineLinks = allLinks.filter(looksLikeInlineTextLink);
    const results = inlineLinks.map(analyzeLink);

    const fails = results.filter(x => x.status === "fail");

    let overallStatus = "pass";
    if (fails.length) overallStatus = "fail";

    const summaryHtml = `
      <p>Geprüft wurden als Inline-Link erkannte <b>&lt;a href&gt;</b>-Elemente im Fließtext.</p>
      <p>Alle gefundenen Links gesamt: <b>${allLinks.length}</b><br>
      Textlinks im Fließtext: <b>${inlineLinks.length}</b><br>
      Problematische Links: <b>${fails.length}</b></p>
    `;

    const failHtml = fails.length
      ? `<ol>
          ${fails.map(renderItem).join("")}
        </ol>`
      : "";

    const emptyHtml = !fails.length
      ? `<p>Es wurden keine problematischen Inline-Links im Fließtext gefunden.</p>`
      : "";

    return {
      id: 'R8020',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Links sollen sich durch mehr als nur die Textfarbe von anderem Text abheben",
      status: overallStatus,
      content: `
        ${summaryHtml}
        ${emptyHtml}
        ${failHtml}
      `
    };
  },

  pruefeListenStruktur() {
    const strukturFehler = [];
    const fakeLists = [];
    const geseheneFakeLists = new Set();

    const bulletTextRe = /^\s*(?:[•◦▪‣⁃∙·●○■–—-]|\d+[.)]|[a-zA-Z][.)])\s+\S/;
    const bulletBeforeRe = /^(?:["'])?\s*(?:[•◦▪‣⁃∙·●○■–—-]|\d+[.)]|[a-zA-Z][.)])\s*(?:["'])?$/;

    function normalizeText(text) {
      return String(text || "").replace(/\s+/g, " ").trim();
    }

    function isHidden(el) {
      const style = window.getComputedStyle(el);
      return style.display === "none" || style.visibility === "hidden";
    }

    function getBeforeContent(el) {
      try {
        const content = window.getComputedStyle(el, "::before").content;
        if (!content || content === "none" || content === "normal") {
          return "";
        }
        return String(content).trim();
      } catch (e) {
        return "";
      }
    }

    function looksLikeFakeListItem(p) {
      const text = normalizeText(p.textContent);
      if (bulletTextRe.test(text)) {
        return true;
      }

      const beforeContent = getBeforeContent(p);
      if (beforeContent && bulletBeforeRe.test(beforeContent)) {
        return true;
      }

      return false;
    }

    function pushStrukturFehler(el, message) {
      strukturFehler.push({
        el: el,
        path: getDomPath(el),
        message
      });
    }

    function pushFakeList(container, items) {
      const examples = items
        .slice(0, 4)
        .map((el) => normalizeText(el.textContent))
        .filter(Boolean);

      const viaCssBefore = items.some((el) => bulletBeforeRe.test(getBeforeContent(el)));
      const key = `${getDomPath(container)}__${items.length}__${examples.join("||")}__${viaCssBefore}`;

      if (geseheneFakeLists.has(key)) {
        return;
      }

      geseheneFakeLists.add(key);

      fakeLists.push({
        /*el: container.firstElementChild,*/
        el: items[0],
        path: getDomPath(container),
        count: items.length,
        examples,
        viaCssBefore
      });
    }

    // Strukturprüfung für <ul> und <ol>
    document.querySelectorAll("ul, ol").forEach((list) => {
      const allowedChildTags = new Set(["LI", "SCRIPT", "TEMPLATE", "STYLE"]);
      const children = Array.from(list.children);

      const invalidChildren = children.filter((child) => !allowedChildTags.has(child.tagName));
      if (invalidChildren.length > 0) {
        pushStrukturFehler(
          list,
          `<${list.tagName.toLowerCase()}> enthält ungültige direkte Kindelemente: ${invalidChildren
            .map((el) => `<${el.tagName.toLowerCase()}>`)
            .join(", ")}`
        );
      }

      const directLiChildren = children.filter((child) => child.tagName === "LI");
      if (directLiChildren.length === 0) {
        pushStrukturFehler(
          list,
          `<${list.tagName.toLowerCase()}> enthält keine direkten <li>-Elemente`
        );
      }
    });

    // Strukturprüfung für <li>
    document.querySelectorAll("li").forEach((li) => {
      const parent = li.parentElement;
      if (!parent || !/^(UL|OL)$/.test(parent.tagName)) {
        pushStrukturFehler(
          li,
          `<li> ist falsch verschachtelt (erwartet direkt innerhalb von <ul> oder <ol>)`
        );
      }
    });

    // Erkennung möglicher Fake-Lists aus <p>-Elementen
    document.querySelectorAll("p").forEach((p) => {
      if (isHidden(p)) {
        return;
      }

      if (p.closest("li")) {
        return;
      }

      if (!looksLikeFakeListItem(p)) {
        return;
      }

      const parent = p.parentElement;
      if (!parent) {
        return;
      }

      const pSiblings = Array.from(parent.children).filter((el) => {
        return el.tagName === "P" && !isHidden(el) && !el.closest("li");
      });

      const currentIndex = pSiblings.indexOf(p);
      if (currentIndex === -1) {
        return;
      }

      let start = currentIndex;
      while (start > 0 && looksLikeFakeListItem(pSiblings[start - 1])) {
        start--;
      }

      // Nur einmal pro zusammenhängender Gruppe prüfen
      if (start !== currentIndex) {
        return;
      }

      let end = currentIndex;
      while (end + 1 < pSiblings.length && looksLikeFakeListItem(pSiblings[end + 1])) {
        end++;
      }

      const group = pSiblings.slice(start, end + 1);

      // Erst ab mindestens 2 aufeinanderfolgenden Absätzen als mögliche Fake-Liste werten
      if (group.length >= 2) {
        pushFakeList(parent, group);
      }
    });

    // 4) Status bestimmen
    let status = "pass";
    if (strukturFehler.length > 0) {
      status = "fail";
    } else if (fakeLists.length > 0) {
      status = "check";
    }

    // 5) Inhalt erzeugen
    let content = `
      <p>Geprüft wurden alle <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code> und <code>&lt;li&gt;</code> auf grundlegende korrekte Verwendung und Verschachtelung. Zusätzlich wurden mögliche "Fake-Listen" gesucht, bei denen Aufzählungen mit <code>&lt;p&gt;</code>-Elementen statt echter Listen ausgezeichnet sind.</p>
      <p>
        Strukturfehler: <strong>${strukturFehler.length}</strong><br>
        Mögliche Fake-Listen: <strong>${fakeLists.length}</strong>
      </p>
    `;

    if (strukturFehler.length > 0) {
      content += `<h4>Strukturfehler</h4><ol>`;
      strukturFehler.forEach((entry) => {
        content += `
          <li>
            <strong>${escapeHtml(entry.message)}</strong><br>
            Position: <code>${escapeHtml(entry.path)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</code></p></summary>
              <div class="clonedElement">${cloneEl(entry.el)}</div>
            </details>
          </li>
        `;
      });
      content += `</ol>`;
    } else {
      content += `<p>Keine Strukturfehler bei <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code> oder <code>&lt;li&gt;</code> gefunden.</p>`;
    }

    if (fakeLists.length > 0) {
      content += `<h4>Mögliche Fake-Listen</h4><ol>`;
      fakeLists.forEach((entry) => {
        const examplesHtml = entry.examples.length
          ? `Listeneinträge: ${entry.examples.map((ex) => `"${escapeHtml(ex)}"`).join(", ")}`
          : "(keine Listeneinträge gefunden)";

        const cssInfo = entry.viaCssBefore
          ? ` (Aufzählungszeichen offenbar über <code>::before</code>)`
          : "";

        content += `
          <li>
            <strong>${examplesHtml}</strong><br>
            ${entry.count} aufeinanderfolgende <code>&lt;p&gt;</code>-Elemente wirken wie eine Liste${cssInfo}<br>
            Position: <code>${escapeHtml(entry.path)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</code></p></summary>
              <div class="clonedElement">${cloneEl(entry.el)}</div>
            </details>
          </li>
        `;
      });
      content += `</ol>`;
    } else {
      content += `<p>Keine offensichtlichen Fake-Listen aus <code>&lt;p&gt;</code>-Elementen gefunden.</p>`;
    }

    return {
      id: 'R1032',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Listenstruktur prüfen",
      status,
      content
    };
  },

  pruefeAutocompleteAttribute() {
    const selector = "input, textarea, select";
    const allElements = Array.from(document.querySelectorAll(selector));

    const ignoredInputTypes = new Set([
      "hidden",
      "submit",
      "reset",
      "button",
      "image",
      "file",
      "range",
      "color",
      "checkbox",
      "radio",
      "search"
    ]);

    const candidateInputTypes = new Set([
      "text",
      "email",
      "tel",
      "url",
      "password",
      "number",
      "date",
      "month",
      "week",
      "time",
      "datetime-local"
    ]);

    const validAutocompleteTokens = new Set([
      "name",
      "honorific-prefix",
      "given-name",
      "additional-name",
      "family-name",
      "honorific-suffix",
      "nickname",
      "username",
      "new-password",
      "current-password",
      "one-time-code",
      "organization-title",
      "organization",
      "street-address",
      "address-line1",
      "address-line2",
      "address-line3",
      "address-level4",
      "address-level3",
      "address-level2",
      "address-level1",
      "country",
      "country-name",
      "postal-code",
      "cc-name",
      "cc-given-name",
      "cc-additional-name",
      "cc-family-name",
      "cc-number",
      "cc-exp",
      "cc-exp-month",
      "cc-exp-year",
      "cc-csc",
      "cc-type",
      "transaction-currency",
      "transaction-amount",
      "language",
      "bday",
      "bday-day",
      "bday-month",
      "bday-year",
      "sex",
      "url",
      "photo",
      "tel",
      "tel-country-code",
      "tel-national",
      "tel-area-code",
      "tel-local",
      "tel-local-prefix",
      "tel-local-suffix",
      "tel-extension",
      "email",
      "impp"
    ]);

    const purposeRules = [
      {
        key: "email",
        expected: "email",
        typeHint: ["email"],
        patterns: [
          /\be-?mail\b/i,
          /\bemail\b/i,
          /\bmail\b/i
        ]
      },
      {
        key: "tel",
        expected: "tel",
        typeHint: ["tel"],
        patterns: [
          /\btelefon\b/i,
          /\bphone\b/i,
          /\btel\b/i,
          /\bmobile\b/i,
          /\bmobil\b/i,
          /\bhandy\b/i
        ]
      },
      {
        key: "given-name",
        expected: "given-name",
        patterns: [
          /\bvorname\b/i,
          /\bfirst.?name\b/i,
          /\bgiven.?name\b/i
        ]
      },
      {
        key: "family-name",
        expected: "family-name",
        patterns: [
          /\bnachname\b/i,
          /\blast.?name\b/i,
          /\bsurname\b/i,
          /\bfamily.?name\b/i
        ]
      },
      {
        key: "name",
        expected: "name",
        patterns: [
          /\bvoller?\s+name\b/i,
          /\bfull.?name\b/i,
          /\bname\b/i
        ]
      },
      {
        key: "username",
        expected: "username",
        patterns: [
          /\bbenutzername\b/i,
          /\busername\b/i,
          /\blogin\b/i,
          /\buser.?id\b/i
        ]
      },
      {
        key: "current-password",
        expected: "current-password",
        typeHint: ["password"],
        patterns: [
          /\bpasswort\b/i,
          /\bpassword\b/i
        ]
      },
      {
        key: "organization",
        expected: "organization",
        patterns: [
          /\bfirma\b/i,
          /\bunternehmen\b/i,
          /\bcompany\b/i,
          /\borganization\b/i,
          /\borganis(?:ation|ation)\b/i
        ]
      },
      {
        key: "street-address",
        expected: "street-address",
        patterns: [
          /\bstra(?:ß|ss)e\b/i,
          /\bstreet\b/i,
          /\baddress\b/i,
          /\badresse\b/i
        ]
      },
      {
        key: "address-level2",
        expected: "address-level2",
        patterns: [
          /\bort\b/i,
          /\bstadt\b/i,
          /\bcity\b/i,
          /\btown\b/i
        ]
      },
      {
        key: "postal-code",
        expected: "postal-code",
        patterns: [
          /\bplz\b/i,
          /\bzip\b/i,
          /\bpostal\b/i,
          /\bpostleitzahl\b/i
        ]
      },
      {
        key: "country-name",
        expected: "country-name",
        patterns: [
          /\bland\b/i,
          /\bcountry\b/i
        ]
      },
      {
        key: "cc-name",
        expected: "cc-name",
        patterns: [
          /\bkarteninhaber\b/i,
          /\bcardholder\b/i,
          /\bname on card\b/i
        ]
      },
      {
        key: "cc-number",
        expected: "cc-number",
        patterns: [
          /\bkreditkarte\b/i,
          /\bcard.?number\b/i,
          /\bkartennummer\b/i,
          /\bcc-?number\b/i
        ]
      },
      {
        key: "cc-exp",
        expected: "cc-exp",
        patterns: [
          /\bablaufdatum\b/i,
          /\bexpiry\b/i,
          /\bexpiration\b/i,
          /\bgültig bis\b/i
        ]
      },
      {
        key: "cc-csc",
        expected: "cc-csc",
        patterns: [
          /\bcvv\b/i,
          /\bcvc\b/i,
          /\bcsc\b/i,
          /\bsicherheitscode\b/i
        ]
      },
      {
        key: "bday",
        expected: "bday",
        patterns: [
          /\bgeburtsdatum\b/i,
          /\bdate of birth\b/i,
          /\bbirthday\b/i
        ]
      }
    ];

    const exclusionPatterns = [
      /\bi am human\b/i,
      /\bnot a robot\b/i,
      /\bcaptcha\b/i,
      /\bsecurity check\b/i,
      /\bsicherheitsabfrage\b/i,
      /\bsearch\b/i,
      /\bsuche\b/i,
      /\bfilter\b/i,
      /\bkommentar\b/i,
      /\bcomment\b/i,
      /\bnachricht\b/i,
      /\bmessage\b/i,
      /\bfeedback\b/i,
      /\bquantity\b/i,
      /\bmenge\b/i,
      /\bcoupon\b/i,
      /\bgutschein\b/i,
      /\bpromo\b/i,
      /\bvoucher\b/i,
      /\bkundennummer\b/i,
      (/\bcustomer.?number\b/i),
      (/\bclient.?id\b/i),
      (/\baccount.?number\b/i),
      (/\bvertragsnummer\b/i)
    ];

    function getFieldText(el) {
      const parts = [];

      const id = el.getAttribute("id");
      if (id) {
        try {
          const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (label && label.textContent) parts.push(label.textContent);
        } catch (e) {}
      }

      const wrappingLabel = el.closest("label");
      if (wrappingLabel && wrappingLabel.textContent) {
        parts.push(wrappingLabel.textContent);
      }

      const ariaLabel = el.getAttribute("aria-label");
      if (ariaLabel) parts.push(ariaLabel);

      const ariaLabelledBy = el.getAttribute("aria-labelledby");
      if (ariaLabelledBy) {
        ariaLabelledBy.split(/\s+/).forEach(function (refId) {
          const ref = document.getElementById(refId);
          if (ref && ref.textContent) parts.push(ref.textContent);
        });
      }

      const placeholder = el.getAttribute("placeholder");
      if (placeholder) parts.push(placeholder);

      const name = el.getAttribute("name");
      if (name) parts.push(name);

      if (id) parts.push(id);

      return parts.join(" ").replace(/\s+/g, " ").trim();
    }

    function isRelevantControl(el) {
      if (!el || el.disabled) return false;

      const tag = el.tagName.toLowerCase();

      if (tag === "select") return true;

      if (tag === "textarea") {
        return false;
      }

      if (tag === "input") {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        if (ignoredInputTypes.has(type)) return false;
        return candidateInputTypes.has(type) || type === "";
      }

      return false;
    }

    function isExcludedByContext(el, fieldText) {
      if (!fieldText) return false;
      return exclusionPatterns.some(function (pattern) {
        return pattern.test(fieldText);
      });
    }

    function inferPurpose(el, fieldText) {
      const type = (el.getAttribute("type") || "").toLowerCase();

      for (const rule of purposeRules) {
        if (rule.typeHint && rule.typeHint.includes(type)) {
          return rule.expected;
        }
      }

      for (const rule of purposeRules) {
        if (rule.patterns.some(function (pattern) { return pattern.test(fieldText); })) {
          return rule.expected;
        }
      }

      return null;
    }

    function validateAutocompleteValue(value) {
      const normalized = String(value || "").trim().toLowerCase();

      if (!normalized) {
        return { valid: false, normalized: normalized, reason: "Leerer Wert" };
      }

      if (normalized === "on" || normalized === "off") {
        return { valid: true, normalized: normalized, reason: "" };
      }

      const tokens = normalized.split(/\s+/).filter(Boolean);
      let i = 0;

      if (tokens[i] && /^section-[a-z0-9_-]+$/i.test(tokens[i])) i++;
      if (tokens[i] === "shipping" || tokens[i] === "billing") i++;

      let remaining = tokens.slice(i);
      if (!remaining.length) {
        return { valid: false, normalized: normalized, reason: "Kein Feldzweck angegeben" };
      }

      if (remaining[remaining.length - 1] === "webauthn") {
        remaining = remaining.slice(0, -1);
      }

      const fieldToken = remaining.join(" ");

      if (!validAutocompleteTokens.has(fieldToken)) {
        return {
          valid: false,
          normalized: normalized,
          reason: `Unbekannter oder nicht unterstützter Wert "${fieldToken}"`
        };
      }

      return { valid: true, normalized: normalized, reason: "" };
    }

    function matchesExpectedPurpose(normalizedAutocomplete, expected) {
      if (!expected) return true;
      if (normalizedAutocomplete === "on" || normalizedAutocomplete === "off") return false;
      return normalizedAutocomplete === expected || normalizedAutocomplete.endsWith(" " + expected);
    }

    const inspected = [];
    const failures = [];
    const warnings = [];
    const excluded = [];

    allElements.forEach(function (el) {
      if (!isRelevantControl(el)) {
        return;
      }

      const fieldText = getFieldText(el);
      const path = getDomPath(el);

      if (isExcludedByContext(el, fieldText)) {
        excluded.push({
          path: path,
          reason: "Ausgenommen, da das Feld nach Beschriftung/Kontext nicht wie ein personenbezogenes Nutzerfeld wirkt."
        });
        return;
      }

      const expectedPurpose = inferPurpose(el, fieldText);

      if (!expectedPurpose) {
        excluded.push({
          path: path,
          reason: "Nicht geprüft, da kein eindeutiger personenbezogener Eingabezweck erkennbar ist."
        });
        return;
      }

      inspected.push({
        el: el,
        path: path,
        expectedPurpose: expectedPurpose,
        fieldText: fieldText
      });
    });

    inspected.forEach(function (entry) {
      const el = entry.el;
      const path = entry.path;
      const expectedPurpose = entry.expectedPurpose;
      const autocomplete = el.getAttribute("autocomplete");

      if (autocomplete === null) {
        failures.push({
          path: path,
          cloned: cloneEl(el),
          message: `Für dieses personenbezogene Feld fehlt autocomplete. Erwartet wäre z. B. "${expectedPurpose}".`
        });
        return;
      }

      const validation = validateAutocompleteValue(autocomplete);

      if (!validation.valid) {
        failures.push({
          path: path,
          cloned: cloneEl(el),
          message: `Ungültiger autocomplete-Wert "${autocomplete}" (${validation.reason}).`
        });
        return;
      }

      if (!matchesExpectedPurpose(validation.normalized, expectedPurpose)) {
        warnings.push({
          path: path,
          cloned: cloneEl(el),
          message: `autocomplete="${autocomplete}" ist vorhanden, passt aber vermutlich nicht zum erkannten Zweck "${expectedPurpose}".`
        });
        return;
      }
    });

    let status = "pass";

    if (failures.length > 0) {
      status = "fail";
    } else if (warnings.length > 0) {
      status = "check";
    }

    function renderList(items) {
      return `<ol>${items
        .map(
          (item) =>
          `<li><strong>${escapeHtml(item.message)}</strong><br>
            Position: <code>${escapeHtml(item.path)}</code><br>
            <details class="clone">
              <summary><p class="toggleText">Element-Vorschau anzeigen</p></summary>
              <div class="clonedElement">
                ${item.cloned}
              </div>
            </details>
          </li>`
        )
        .join("")}</ol>`;
    }

    let content = `
    <p>
      Geprüft wurden <strong>${inspected.length}</strong> wahrscheinlich personenbezogene Eingabefelder<br>
      Nicht einbezogen: <strong>${excluded.length}</strong> Felder ohne klaren Personenbezug oder mit erkanntem Sonderzweck.<br>
      Fehler: <strong>${failures.length}</strong><br>Hinweise: <strong>${warnings.length}</strong>
    </p>
    `;

    if (failures.length > 0) {
      content += "<h4>Fehler</h4>" + renderList(failures);
    }

    if (warnings.length > 0) {
      content += "<h4>Hinweise</h4>" + renderList(warnings);
    }

    if (failures.length === 0 && warnings.length === 0 && inspected.length > 0) {
      content += "<p>Für die erkannten personenbezogenen Eingabefelder wurden passende autocomplete-Angaben gefunden.</p>";
    }

    if (inspected.length === 0) {
      content += "<p>Es wurden keine eindeutig personenbezogenen Eingabefelder erkannt, die unter diese Prüfung fallen.</p>";
    }

    return {
      id: 'R2135',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Autocomplete-Attribute prüfen",
      status: status,
      content: content
    };
  },

  pruefeLabelInName() {
    const elements = document.querySelectorAll(`
      button,
      a[href],
      input[type="button"],
      input[type="submit"],
      input[type="reset"]
    `);

    const issues = [];

    elements.forEach((el) => {
      const visibleText = (el.innerText || el.value || "").trim();

      let accessibleName = "";

      if (el.hasAttribute("aria-label")) {
        accessibleName = el.getAttribute("aria-label").trim();
      } else if (el.hasAttribute("aria-labelledby")) {
        const ids = el.getAttribute("aria-labelledby").split(/\s+/);
        accessibleName = ids
          .map((id) => document.getElementById(id)?.innerText || "")
          .join(" ")
          .trim();
      } else if (el.alt) {
        accessibleName = el.alt.trim();
      } else {
        accessibleName = visibleText;
      }

      if (visibleText) {
        const visibleLower = visibleText.toLowerCase();
        const accessibleLower = accessibleName.toLowerCase();

        if (!accessibleLower.includes(visibleLower)) {
          issues.push({
            el: el,
            tagName: el.tagName.toLowerCase(),
            visibleText,
            accessibleName: accessibleName || "(leer)"
          });
        }
      }
    });

    if (issues.length === 0) {
      return {
        id: 'R1253',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Sichtbare Beschriftung im Namen",
        status: "pass",
        content: "Es wurden keine Probleme mit zugänglichen Namen in Bedienelementen erkannt oder gefunden."
      };
    }

    const listItems = issues
      .map((issue) => `
        <li>
          <strong>Element:</strong> &lt;${issue.tagName}&gt;<br>
          <strong>Sichtbare Beschriftung:</strong> ${escapeHtml(issue.visibleText)}<br>
          <strong>Zugänglicher Name:</strong> ${escapeHtml(issue.accessibleName)}

          <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(issue.el)}</div>
            </details>
        </li>
      `)
    .join("");

    return {
      id: 'R1253',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Sichtbare Beschriftung im Namen",
      status: "fail",
      content: `
        <p>Es wurden ${issues.length} Problem(e) gefunden:</p>
        <ol>
          ${listItems}
        </ol>
      `
    };
  },

  pruefeFormularBeschriftungen() {
    const selector = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="image"])',
      'select',
      'textarea'
    ].join(',');

    const elements = Array.from(document.querySelectorAll(selector));

    function isElementVisible(el) {
      if (!el || !(el instanceof Element)) return false;

      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        parseFloat(style.opacity) === 0
      ) {
        return false;
      }

      if (el.hidden || el.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      const rects = el.getClientRects();
      return rects.length > 0;
    }

    function isTextNodeVisible(textNode) {
      if (!textNode || !textNode.textContent || !textNode.textContent.trim()) {
        return false;
      }

      const parent = textNode.parentElement;
      if (!parent || !isElementVisible(parent)) {
        return false;
      }

      const range = document.createRange();
      range.selectNodeContents(textNode);

      const rects = range.getClientRects();
      return rects.length > 0;
    }

    function getVisibleTextFromElement(el) {
      if (!el || !isElementVisible(el)) return '';

      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return node.textContent.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );

      const parts = [];
      let node;

      while ((node = walker.nextNode())) {
        if (isTextNodeVisible(node)) {
          parts.push(node.textContent.trim());
        }
      }

      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    function getLabelByFor(el) {
      if (!el.id) return null;

      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (!label) return null;

      const text = getVisibleTextFromElement(label);
      if (!text) return null;

      return {
        type: 'label[for]',
        text,
        source: label
      };
    }

    function getWrappingLabel(el) {
      const label = el.closest('label');
      if (!label) return null;

      const text = getVisibleTextFromElement(label);
      if (!text) return null;

      return {
        type: 'wrapping label',
        text,
        source: label
      };
    }

    function getAriaLabelledby(el) {
      const value = el.getAttribute('aria-labelledby');
      if (!value) return null;

      const ids = value.trim().split(/\s+/).filter(Boolean);
      const texts = [];
      const sources = [];

      ids.forEach((id) => {
        const ref = document.getElementById(id);
        if (!ref) return;

        const text = getVisibleTextFromElement(ref);
        if (!text) return;

        texts.push(text);
        sources.push(ref);
      });

      if (!texts.length) return null;

      return {
        type: 'aria-labelledby',
        text: texts.join(' ').replace(/\s+/g, ' ').trim(),
        source: sources[0]
      };
    }

    function getNearbyVisibleText(el) {
      const candidates = [];

      if (el.parentElement) candidates.push(el.parentElement);

      const prev = el.previousElementSibling;
      if (prev) candidates.push(prev);

      let current = el.parentElement;
      let depth = 0;
      while (current && depth < 2) {
        const possible = current.querySelector('legend');
        if (possible) candidates.push(possible);
        current = current.parentElement;
        depth++;
      }

      for (const candidate of candidates) {
        const text = getVisibleTextFromElement(candidate);
        if (!text) continue;

        const cleaned = text.replace(/\s+/g, ' ').trim();
        if (cleaned && cleaned.length <= 200) {
          return {
            type: 'nearby text',
            text: cleaned,
            source: candidate
          };
        }
      }

      return null;
    }

    function getVisibleLabelInfo(el) {
      return (
        getLabelByFor(el) ||
        getWrappingLabel(el) ||
        getAriaLabelledby(el) ||
        getNearbyVisibleText(el)
      );
    }

    const relevantElements = elements.filter(isElementVisible);
    const issues = [];
    const warnings = [];
    const passes = [];

    relevantElements.forEach((el) => {
      const labelInfo = getVisibleLabelInfo(el);
      const domPath = getDomPath(el);

      if (!labelInfo) {
        issues.push(`
          <li>
            <strong>Fehlende Beschriftung</strong><br>
            Keine sichtbare Beschriftung gefunden.<br>
            Position: <code>${escapeHtml(domPath)}</code><br>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(el)}</div>
            </details>
          </li>
        `);
        return;
      }

      const hasProgrammaticAssociation =
        labelInfo.type === 'label[for]' ||
        labelInfo.type === 'wrapping label' ||
        labelInfo.type === 'aria-labelledby';

      if (!hasProgrammaticAssociation) {
        warnings.push(`
          <li>
            Beschriftung: <strong>"${escapeHtml(labelInfo.text)}"</strong><br>
            Es wurde nur sichtbarer Text in der Umgebung gefunden, aber keine eindeutige technische Zuordnung per <code>label</code> oder <code>aria-labelledby</code>.<br>
            Position: <code>${escapeHtml(domPath)}</code><br>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(el)}</div>
            </details>
          </li>
        `);
        return;
      }

      passes.push(`<li><code>${escapeHtml(domPath)}</code></li>`);
    });

    if (!relevantElements.length) {
      return {
        id: 'R1332',
        reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
        title: "Sichtbare Beschriftungen von Formularelementen",
        status: "pass",
        content: "Es wurden keine sichtbaren relevanten Formularelemente gefunden."
      };
    }

    let status = "pass";
    if (issues.length) {
      status = "fail";
    } else if (warnings.length) {
      status = "check";
    }

    const summary = `
      <p>
        Geprüfte sichtbare Formularelemente: <strong>${relevantElements.length}</strong><br>
        Mit sichtbarer und technisch zugeordneter Beschriftung: <strong>${passes.length}</strong><br>
        Manuell prüfen: <strong>${warnings.length}</strong><br>
        Ohne erkennbare sichtbare Beschriftung: <strong>${issues.length}</strong>
      </p>
    `;

    const details = `
      ${issues.length ? `<h4>Nicht bestanden</h4><ol>${issues.join('')}</ol>` : ''}
      ${warnings.length ? `<h4>Manuell prüfen</h4><ol>${warnings.join('')}</ol>` : ''}
    `;

    return {
      id: 'R1332',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Sichtbare Beschriftungen von Formularelementen",
      status,
      content: summary + details
    };
  },

  pruefeBeschriftungenStrengWCAG() {
    const labelableSelector = [
      'input:not([type="hidden"])',
      'select',
      'textarea',
      'output',
      'progress',
      'meter'
    ].join(',');

    const formControlSelector = [
      'input:not([type="hidden"])',
      'select',
      'textarea'
    ].join(',');

    function isElementVisible(el) {
      if (!el || !(el instanceof Element)) return false;

      if (el.hidden || el.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        parseFloat(style.opacity) === 0
      ) {
        return false;
      }

      return el.getClientRects().length > 0;
    }

    function isTextNodeVisible(textNode) {
      if (!textNode || !textNode.textContent || !textNode.textContent.trim()) {
        return false;
      }

      const parent = textNode.parentElement;
      if (!parent || !isElementVisible(parent)) return false;

      try {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        return range.getClientRects().length > 0;
      } catch (e) {
        return false;
      }
    }

    function getVisibleText(el) {
      if (!el || !isElementVisible(el)) return '';

      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return node.textContent && node.textContent.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );

      const parts = [];
      let node;
      while ((node = walker.nextNode())) {
        if (isTextNodeVisible(node)) {
          parts.push(node.textContent.trim());
        }
      }

      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    function isLabelableElement(el) {
      if (!el || !(el instanceof Element)) return false;
      if (!el.matches(labelableSelector)) return false;

      if (el.matches('input')) {
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        return type !== 'hidden';
      }

      return true;
    }

    function isFormControl(el) {
      return !!(el && el.matches && el.matches(formControlSelector));
    }

    function getAssociatedControlForLabel(label) {
      const forId = label.getAttribute('for');
      if (forId) {
        const target = document.getElementById(forId);
        return {
          mode: 'for',
          forId,
          target: target || null
        };
      }

      const nestedControls = Array.from(label.querySelectorAll(labelableSelector));
      if (nestedControls.length === 1) {
        return {
          mode: 'nested',
          target: nestedControls[0]
        };
      }

      if (nestedControls.length > 1) {
        return {
          mode: 'nested-multiple',
          target: null,
          nestedControls
        };
      }

      return {
        mode: 'none',
        target: null
      };
    }

    function getExplicitLabelsForControl(control) {
      if (!control.id) return [];
      return Array.from(document.querySelectorAll(`label[for="${CSS.escape(control.id)}"]`));
    }

    function getImplicitLabelsForControl(control) {
      return Array.from(document.querySelectorAll('label')).filter(label => {
        if (label.hasAttribute('for')) return false;
        return label.contains(control);
      });
    }

    function getAllLabelsForControl(control) {
      return [...getExplicitLabelsForControl(control), ...getImplicitLabelsForControl(control)];
    }

    function getAriaLabelledbyReferences(control) {
      const ids = (control.getAttribute('aria-labelledby') || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      return ids.map(id => document.getElementById(id)).filter(Boolean);
    }

    function findNearestGroupContainer(el) {
      return (
        el.closest('.form-group, .field, .form-field, .mb-3, .row, .col, td, th, div, li') ||
        el.parentElement
      );
    }

    function findVisibleTextCandidatesNearControl(control) {
      const results = [];
      const seen = new Set();

      const group = findNearestGroupContainer(control);
      if (!group) return results;

      const candidates = Array.from(
        group.querySelectorAll([
          'label',
          'legend',
          '[id]',
          '.control-label',
          '.form-label',
          '.col-form-label',
          '[class*="label"]'
        ].join(','))
      );

      candidates.forEach(el => {
        if (el === control) return;
        if (!isElementVisible(el)) return;

        const text = getVisibleText(el);
        if (!text) return;

        const key = getDomPath(el);
        if (seen.has(key)) return;
        seen.add(key);

        results.push({
          el,
          text,
          domPath: key
        });
      });

      return results;
    }

    function isPotentialLabelLikeElement(el) {
      if (!el || !(el instanceof Element)) return false;
      if (!isElementVisible(el)) return false;
      if (el.tagName.toLowerCase() === 'label') return false;
      if (el.tagName.toLowerCase() === 'legend') return false;

      const text = getVisibleText(el);
      if (!text) return false;
      if (text.length > 120) return false;

      if (
        el.matches('.control-label, .form-label, .col-form-label, [class*="label"]')
      ) {
        return true;
      }

      return false;
    }

    const issues = [];
    const warnings = [];
    const passes = [];

    const allLabels = Array.from(document.querySelectorAll('label'));
    const visibleLabels = allLabels.filter(isElementVisible);
    const allControls = Array.from(document.querySelectorAll(formControlSelector)).filter(isElementVisible);
    const allFieldsets = Array.from(document.querySelectorAll('fieldset')).filter(isElementVisible);

    // 1) Labels selbst prüfen
    visibleLabels.forEach(label => {
      const text = getVisibleText(label);
      const labelDesc = getElTag(label);
      const labelPath = getDomPath(label);
      const assoc = getAssociatedControlForLabel(label);

      if (!text) {
        warnings.push(`
          <li>
            <strong><label ohne Textstrong><br>
            Sichtbares <code>label</code> ohne erkennbaren sichtbaren Text. Manuell prüfen.<br>
            Element: <code>${escapeHtml(labelDesc)}</code><br>
            Position: <code>${escapeHtml(labelPath)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(label)}</div>
              </details>
          </li>
        `);
        return;
      }

      if (assoc.mode === 'for') {
        if (!assoc.target) {
          issues.push(`
            <li>
              Text: <strong>"${escapeHtml(text)}"</strong><br>
              <code>for="${escapeHtml(assoc.forId)}"</code> verweist auf kein existierendes Element.<br>
              Element: <code>${escapeHtml(labelDesc)}</code><br>
              Position: <code>${escapeHtml(labelPath)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(label)}</div>
              </details>
            </li>
          `);
          return;
        }

        if (!isLabelableElement(assoc.target)) {
          issues.push(`
            <li>
              Text: <strong>"${escapeHtml(text)}"</strong><br>
              <code>for="${escapeHtml(assoc.forId)}"</code> verweist auf ${getElTag(assoc.target)}, aber dieses Element ist nicht beschriftbar.<br>
              Element: <code>${escapeHtml(labelDesc)}</code><br>
              Position: <code>${escapeHtml(labelPath)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(label)}</div>
              </details>
            </li>
          `);
          return;
        }

        if (!isElementVisible(assoc.target)) {
          warnings.push(`
            <li>
              Text: <strong>"${escapeHtml(text)}"</strong><br>
              Das referenzierte Element ist nicht sichtbar. Manuell prüfen, ob die Zuordnung im Prüfumfang relevant ist.<br>
              Element: <code>${escapeHtml(labelDesc)}</code><br>
              Position: <code>${escapeHtml(labelPath)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(label)}</div>
              </details>
            </li>
          `);
          return;
        }

        passes.push(`
          <li>
            ${labelDesc}<br>
            Pfad: <code>${escapeHtml(labelPath)}</code><br>
            Beschriftung "${escapeHtml(text)}" ist per <code>for</code> korrekt mit ${getElTag(assoc.target)} verknüpft.
          </li>
        `);
        return;
      }

      if (assoc.mode === 'nested') {
        if (!isLabelableElement(assoc.target)) {
          issues.push(`
            <li>
              Text: <strong>"${escapeHtml(text)}"</strong><br>
              Das umschlossene Element ist nicht beschriftbar.<br>
              Element: <code>${escapeHtml(labelDesc)}</code><br>
              Position: <code>${escapeHtml(labelPath)}</code>
              <details class="clone">
                <summary><p class="toggleText">Element anzeigen</p></summary>
                <div class="clonedElement">${cloneEl(label)}</div>
              </details>
            </li>
          `);
          return;
        }

        passes.push(`
          <li>
            ${labelDesc}<br>
            Pfad: <code>${escapeHtml(labelPath)}</code><br>
            Beschriftung "${escapeHtml(text)}" umschließt ${getElTag(assoc.target)} korrekt.
          </li>
        `);
        return;
      }

      if (assoc.mode === 'nested-multiple') {
        issues.push(`
          <li>
            Text: <strong>"${escapeHtml(text)}"</strong><br>
            Das <code>label</code> enthält mehrere Formular-/beschriftbare Elemente. Die Zuordnung ist nicht eindeutig.<br>
            Element: <code>${escapeHtml(labelDesc)}</code><br>
            Position: <code>${escapeHtml(labelPath)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(label)}</div>
            </details>
          </li>
        `);
        return;
      }

      issues.push(`
        <li>
          Text: <strong>"${escapeHtml(text)}"</strong><br>
          <code>label</code> hat weder ein gültiges <code>for</code>-Attribut noch umschließt es ein Formularfeld.<br>
          Element: <code>${escapeHtml(labelDesc)}</code><br>
          Position: <code>${escapeHtml(labelPath)}</code>
          <details class="clone">
            <summary><p class="toggleText">Element anzeigen</p></summary>
            <div class="clonedElement">${cloneEl(label)}</div>
          </details>
        </li>
      `);
    });

    // 2) Mehrfachbeschriftungen pro Feld
    allControls.forEach(control => {
      const labels = getAllLabelsForControl(control).filter(isElementVisible);
      const visibleLabelTexts = labels
        .map(getVisibleText)
        .filter(Boolean);

      const ariaRefs = getAriaLabelledbyReferences(control)
        .filter(isElementVisible)
        .map(ref => ({
          el: ref,
          text: getVisibleText(ref)
        }))
        .filter(item => item.text);

      const controlDesc = getElTag(control);
      const controlPath = getDomPath(control);

      if (labels.length > 1) {
        warnings.push(`
          <li>
            <strong>Feld hat mehrere label-Elemente</strong>
            Dem Feld sind mehrere sichtbare <code>label</code>-Elemente zugeordnet (${labels.length}): "${escapeHtml(visibleLabelTexts.join('" / "'))}". Manuell prüfen, ob dies beabsichtigt und verständlich ist.<br>
            Element: <code>${escapeHtml(controlDesc)}</code><br>
            Position: <code>${escapeHtml(controlPath)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(control)}</div>
            </details>
          </li>
        `);
      }

      const nearbyCandidates = findVisibleTextCandidatesNearControl(control)
        .filter(item => item.el !== control);

      const distinctNearbyTexts = Array.from(new Set(nearbyCandidates.map(item => item.text)));
      const distinctProgrammaticTexts = Array.from(new Set([
        ...visibleLabelTexts,
        ...ariaRefs.map(x => x.text)
      ]));

      if (
        distinctProgrammaticTexts.length === 1 &&
        distinctNearbyTexts.length > 1
      ) {
        warnings.push(`
          <li>
            <strong>Mehrere mögliche Beschriftungen</strong><br>
            Im nahen Umfeld wurden mehrere sichtbare Beschriftungskandidaten gefunden (${distinctNearbyTexts.length}). Manuell prüfen, ob die sichtbare Beschriftung eindeutig ist.<br>
            Element: <code>${escapeHtml(controlDesc)}</code><br>
            Position: <code>${escapeHtml(controlPath)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(control)}</div>
            </details>
          </li>
        `);
      }
    });

    // 3) fieldset / legend prüfen
    allFieldsets.forEach(fieldset => {
      const controlsInFieldset = Array.from(fieldset.querySelectorAll(formControlSelector)).filter(isElementVisible);
      if (!controlsInFieldset.length) return;

      const legends = Array.from(fieldset.querySelectorAll(':scope > legend')).filter(isElementVisible);
      const visibleLegendsWithText = legends
        .map(legend => ({ legend, text: getVisibleText(legend) }))
        .filter(item => item.text);

      const fieldsetDesc = getElTag(fieldset);
      const fieldsetPath = getDomPath(fieldset);

      if (!visibleLegendsWithText.length) {
        warnings.push(`
          <li>
            <strong>Fehlendes legend-Element</strong><br>
            <code>fieldset</code> mit sichtbaren Formularfeldern, aber ohne sichtbares <code>legend</code>. Bei Gruppen gleichartiger Auswahlfelder kann das ein WCAG-relevantes Problem sein.<br>
            Element: <code>${escapeHtml(fieldsetDesc)}</code><br>
            Position: <code>${escapeHtml(fieldsetPath)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(fieldset)}</div>
            </details>
          </li>
        `);
        return;
      }

      if (visibleLegendsWithText.length > 1) {
        warnings.push(`
          <li>
            <strong>Mehrere <code>legend</code>-Elemente</strong><br>
            Mehrere sichtbare <code>legend</code>-Elemente gefunden. Manuell prüfen, ob die Gruppenbeschriftung eindeutig ist.<br>
            Element: <code>${escapeHtml(fieldsetDesc)}</code><br>
            Position: <code>${escapeHtml(fieldsetPath)}</code>
            <details class="clone">
              <summary><p class="toggleText">Element anzeigen</p></summary>
              <div class="clonedElement">${cloneEl(fieldset)}</div>
            </details>
          </li>
        `);
        return;
      }

      passes.push(`
        <li>
          ${escapeHtml(fieldsetDesc)}<br>
          Pfad: <code>${escapeHtml(fieldsetPath)}</code><br>
          Gruppenbeschriftung per <code>legend</code>: "${escapeHtml(visibleLegendsWithText[0].text)}"
        </li>
      `);
    });

    // 4) label-ähnliche Elemente prüfen
    const potentialLabelLikeElements = Array.from(document.querySelectorAll([
      '.control-label',
      '.form-label',
      '.col-form-label',
      '[class*="label"]'
    ].join(',')))
      .filter(isPotentialLabelLikeElement);

    const seenPseudo = new Set();

    potentialLabelLikeElements.forEach(el => {
      const path = getDomPath(el);
      if (seenPseudo.has(path)) return;
      seenPseudo.add(path);

      const text = getVisibleText(el);
      const desc = getElTag(el);

      const hasOwnFor = el.hasAttribute('for');
      const isReferencedByAria = !!(
        el.id &&
        document.querySelector(`[aria-labelledby~="${CSS.escape(el.id)}"]`)
      );
      const parentLabel = el.closest('label');
      const sameGroup = findNearestGroupContainer(el);
      const nearbyControls = sameGroup
        ? Array.from(sameGroup.querySelectorAll(formControlSelector)).filter(isElementVisible)
        : [];

      if (parentLabel) return;
      if (hasOwnFor) return;
      if (isReferencedByAria) return;
      if (!nearbyControls.length) return;

      const realLabelInGroup = sameGroup.querySelector('label, legend');
      if (realLabelInGroup) return;

      warnings.push(`
        <li>
          Beschriftung: <strong>"${escapeHtml(text)}"</strong><br>
          Dieses Element wirkt wie eine sichtbare Beschriftung für ein Formularfeld, ist aber nicht programmatisch als <code>label</code> oder per <code>aria-labelledby</code> mit einem Feld verknüpft.<br>
          Element: <code>${escapeHtml(desc)}</code><br>
          Position: <code>${escapeHtml(path)}</code>
          <details class="clone">
            <summary><p class="toggleText">Element anzeigen</p></summary>
            <div class="clonedElement">${cloneEl(el)}</div>
          </details>
        </li>
      `);
    });

    const checkedCount = visibleLabels.length + allFieldsets.length + potentialLabelLikeElements.length;

    let status = 'pass';
    if (issues.length) {
      status = 'fail';
    } else if (warnings.length) {
      status = 'check';
    }

    const summary = `
      <p>
        Fehlerhafte Zuordnungen: <strong>${issues.length}</strong><br>
        Manuell prüfen: <strong>${warnings.length}</strong>
      </p>
      <p>
        Geprüft wurden sichtbare <code>label</code>-, <code>fieldset</code>/<code>legend</code>- und label-ähnliche Elemente. Die Auswertung ist streng und für WCAG-Prüfungen gedacht, ersetzt aber keine manuelle Fachprüfung.
      </p>
    `;

    const details = `
      ${issues.length ? `<h4>Nicht bestanden</h4><ol>${issues.join('')}</ol>` : ''}
      ${warnings.length ? `<h4>Manuell prüfen</h4><ol>${warnings.join('')}</ol>` : ''}
    `;

    return {
      id: 'R1038',
      reqLink: ['https://www.geogebra.org/calculator', 'Link-Text'],
      title: "Beschriftungen und Gruppierungsbeschriftungen von Formularfeldern",
      status,
      content: summary + details
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

function highlightEl(el) {
  el.style.border = "5px solid #f0f";
  el.style.background = "#f0f8";
  el.style.boxShadow = "0 0 10px #f0f8";
}

function cloneEl(el) {
  /*return el.parentElement.outerHTML;*/
  el.classList.add("highlight-temp");
  const html = el.parentElement.outerHTML;
  el.classList.remove("highlight-temp");
  return html;
}

function getSelector(el) {
  if (!el) return "(node)";
  let s = (el.tagName || "").toLowerCase();

  if (el.classList && el.classList.length) {
    s += "." + Array.from(el.classList).slice(0, 6).join(".");
  }

  if (el.id) {
    s += "#" + el.id;
  }

  return (s || "(node)");
}

function getElTag(el) {
  const openingTag = el.cloneNode(false).outerHTML;
  return openingTag.slice(0, openingTag.indexOf('</'));
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
}

window.PageAnalyzerTests = tests;

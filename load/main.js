// main.js

const tests = {
  imagesMissingAlt() {
    const images = [...document.querySelectorAll("img")];
    const missingAlt = images.filter(img => !img.hasAttribute("alt"));

    return {
      title: "Bilder ohne Alt-Tag",
      status: missingAlt.length === 0 ? "pass" : "fail",
      content: missingAlt.length === 0
        ? "All images have an <code>alt</code> attribute."
        : `
          <p><strong>${missingAlt.length}</strong> image(s) are missing an <code>alt</code> attribute.</p>
          <ol>
            ${missingAlt.slice(0, 20).map((img, i) => `
              <li>${escapeHtml(img.outerHTML.slice(0, 200))}<br>Position: <code>${getDomPath(img)}</code>${img.hasAttribute('src') ? `<br><img src="${img.src}" height="100">` : ''}</li>
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
      title: "Bilder mit leerem Alt-Tag",
      status: emptyAltImages.length === 0 ? "pass" : "check",
      content: emptyAltImages.length === 0
        ? "<p>Alle Alt-Texte in Bildern sind befüllt.</p>"
        : `
          <p><strong>${emptyAltImages.length}</strong> Bilder haben leere Alt-Texte und müssen <strong>manuell geprüft</strong> werden.</p>
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
      title: "Links without text",
      status: badLinks.length === 0 ? "pass" : "fail",
      content: badLinks.length === 0
        ? "<p>No empty links found.</p>"
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

  oneH1() {
    const count = document.querySelectorAll('h1').length;
    /*document.querySelectorAll('h1').forEach(el => highlightEl(el));*/

    return {
      title: "Only one H1",
      status: (count === 1) ? "pass" : "fail",
      content: (count === 1)
        ? `Heading: <strong>${escapeHtml(document.querySelector('h1').textContent)}</strong>`
        : ((count <= 0) ? "This page has no heading h1." : 'This page has more than one h1 heading.')
    };
  },

  /*headingsList() {
    return {
      title: "Headings list",
      status: headings.length === 0 ? "fail" : "pass",
      content: headings.length === 0
        ? "<p>No headings found on the page.</p>"
        : `
          <p><strong>${headings.length}</strong> heading(s) found.</p>
          <ul>
            ${headings.map((el, i) => {
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
  },*/

  /*headingJumps() {*/
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

    let headingList_content = (headings.length === 0)
        ? "<p>No headings found on the page.</p>"
        : `
          <p><strong>${headings.length}</strong> heading(s) found.</p>
          <ul>
            ${headings.map((el, i) => {
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
        `;

    let headingJumps_content = (jumps.length === 0)
        ? "<p>No heading hierarchy jumps found.</p>"
        : `
          <p><strong>${jumps.length}</strong> jump(s) in heading hierarchy found.</p>
          <ol>
            ${jumps.slice(0, 20).map((jump, i) => `
              <li>
                <strong>Sprung von &lt;h${jump.fromLevel}&gt; zu &lt;h${jump.toLevel}&gt;</strong><br>
                ${escapeHtml((jump.from.textContent || "").trim() || "(ohne Text)")} zu ${escapeHtml((jump.to.textContent || "").trim() || "(ohne Text)")}<br>
                In Position: <code>${escapeHtml(getDomPath(jump.to))}</code>
              </li>
            `).join("")}
          </ol>
          ${jumps.length > 20 ? "<p>Only the first 20 are shown.</p>" : ""}
        `

    return {
      title: "Heading hierarchy jumps",
      status: jumps.length === 0 ? "pass" : "fail",
      content: `${headingJumps_content}${headingList_content}`
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

        results.push(`${selector || "(node)"}: ${matches.join(" | ")}<br>Position: <code>${getDomPath(el)}</code>`);
      }
    });

    if (results.length === 0) {
      return {
        title: "CSS-Text in Pseudo-Elementen",
        status: "pass",
        content: '<p>Kein per CSS eingebundener Text über "::before" oder "::after" mit mehr als 2 Zeichen gefunden.</p>'
      };
    }

    return {
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

    if (messages.length === 0) {
      messages.push("Die geprüften Landmarken wurden in sinnvoller Form gefunden.");
    }

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

    return {
      title: "Landmarken",
      status,
      content: `
        ${messages.map((msg) => `<div>${msg}</div>`).join("")}
        <div style="margin-top:8px;">${summaryList}</div>
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
        title: "Struktur sichtbarer Tabellen prüfen",
        status: "pass",
        content: visibleTables.length
          ? `Alle ${visibleTables.length} visuell gestalteten Tabellen sind korrekt aufgebaut und verschachtelt.`
          : "Keine visuell gestalteten Tabellen gefunden."
      };
    }

    const html = `
      <div>Geprüfte visuell gestaltete Tabellen: <b>${visibleTables.length}</b></div>
      <div>Fehlerblöcke: <b>${issues.length}</b></div>
      <div style="margin-top:10px">
        ${issues
          .map(
            (item, index) => `
              <div style="padding:8px 0;">
                <div><b>${index + 1}. ${escapeHtml(item.label)}</b></div>
                ${item.errors
                  .map(
                    (err) => `
                      <div style="margin-top:6px;">
                        ${escapeHtml(err)}
                      </div>
                    `
                  )
                  .join("")}
                <div style="margin-top:6px;">
                  Pfad: <code>${escapeHtml(item.path)}</code>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    return {
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
        title: "Visuell transparente Tabellen prüfen",
        status: "pass",
        content: transparentTables.length
          ? `Keine verbotenen Elemente oder Attribute in ${transparentTables.length} visuell transparenten Tabellen gefunden.`
          : "Keine visuell transparenten Tabellen gefunden."
      };
    }

    const html = `
      <div>Geprüfte visuell transparente Tabellen: <b>${transparentTables.length}</b></div>
      <div>Fehlerhafte Tabellen: <b>${issues.length}</b></div>
      <div style="margin-top:10px">
        ${issues
          .map(
            (item, index) => `
              <div style="padding:8px 0;">
                <div><b>${index + 1}. ${escapeHtml(item.label)}</b></div>
                ${item.errors
                  .map(
                    (err) => `
                      <div style="margin-top:6px;">
                        ${escapeHtml(err)}
                      </div>
                    `
                  )
                  .join("")}
                <div style="margin-top:6px">
                  Pfad: <code>${escapeHtml(item.path)}</code>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    return {
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
    let content = "Das <code>&lt;html&gt;</code>-Element hat ein gesetztes und nicht-leeres <code>lang</code>-Attribut.";

    if (!htmlEl) {
      status = "fail";
      content = "Es konnte kein <code>&lt;html&gt;</code>-Element gefunden werden.";
    } else if (!hasLang) {
      status = "fail";
      content = "Dem <code>&lt;html&gt;</code>-Element fehlt das Attribut <code>lang</code>.";
    } else if (!langValue) {
      status = "fail";
      content = "Das <code>&lt;html&gt;</code>-Element hat ein leeres <code>lang</code>-Attribut.";
    }

    return {
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
        title: "Leere Tags ohne Attribute",
        status: "pass",
        content: `
          <div>Es wurden keine leeren Tags ohne Attribute gefunden.</div>
        `
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
                <code>${escapeHtml(el.outerHTML)}</code><br>
                Position: <code>${escapeHtml(getDomPath(el))}</code>
              </li>
            `;
          })
          .join("");

        return `
          <div style="margin-bottom:12px;">
            <ul style="margin-top:6px;">
              ${eintraege}
            </ul>
          </div>
        `;
      })
      .join("");

    return {
      title: "Leere Tags ohne Attribute",
      status: "check",
      content: `
        <div>
          Es wurden <b>${leereElemente.length}</b> leere Tags ohne Attribute gefunden.
        </div>
        <div class="sub" style="margin-top:8px;">
          Geprüft wurden nur Elemente ohne Attribute, ohne Textinhalt und ohne Kindelemente.
          Void-Elemente wie <code>&lt;br&gt;</code>, <code>&lt;hr&gt;</code> oder <code>&lt;meta&gt;</code> wurden ignoriert.
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

      const rows = Object.entries(x.diff)
        .filter(([, v]) => v && String(v.link) !== String(v.context))
        .map(([key, v]) => `
          <div style="margin-top:4px;">
            <b>${escapeHtml(labels[key] || key)}:</b>
            Text = <code>${escapeHtml(v.context || "(leer)")}</code>
            → Link = <code>${escapeHtml(v.link || "(leer)")}</code>
          </div>
        `)
        .join("");

      return rows || '';
    };

    const renderItem = (x, i) => {
      return `
        <div style="padding:10px 0;">
          <div><b>${i + 1}. ${escapeHtml(x.text)}</b></div>
          <div style="margin-top:6px;">${escapeHtml(x.reason)}</div>
          <div style="margin-top:6px;">
            Link-Farbe: <code>${escapeHtml(x.linkColor)}</code> ·
            Umgebender Text: <code>${escapeHtml(x.ctxColor)}</code>
            ${x.contrast != null ? ` · Kontrast Link/Text: <b>${escapeHtml(x.contrast.toFixed(2))}:1</b>` : ""}
          </div>
          ${renderDiffs(x)}
          <div style="margin-top:6px;">Position: <code>${escapeHtml(x.path)}</code></div>
        </div>
      `;
    };

    const allLinks = Array.from(document.querySelectorAll("a[href]"));
    const inlineLinks = allLinks.filter(looksLikeInlineTextLink);
    const results = inlineLinks.map(analyzeLink);

    const fails = results.filter(x => x.status === "fail");

    let overallStatus = "pass";
    if (fails.length) overallStatus = "fail";

    const summaryHtml = `
      <div>
        Geprüft wurden als Inline-Link erkannte <b>&lt;a href&gt;</b>-Elemente im Fließtext.
      </div>
      <div style="margin-top:8px;">
        Alle gefundenen Links gesamt: <b>${allLinks.length}</b><br>
        Textlinks im Fließtext: <b>${inlineLinks.length}</b><br>
        Problematische Links: <b>${fails.length}</b>
      </div>
    `;

    const failHtml = fails.length
      ? `
        <div style="margin-top:12px;">
          ${fails.map(renderItem).join("")}
        </div>
      `
      : "";

    const emptyHtml = !fails.length
      ? `<div style="margin-top:8px;">Es wurden keine problematischen Inline-Links im Fließtext gefunden.</div>`
      : "";

    return {
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
        path: getDomPath(container),
        count: items.length,
        examples,
        viaCssBefore
      });
    }

    // 1) Strukturprüfung für <ul> und <ol>
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

    // 2) Strukturprüfung für <li>
    document.querySelectorAll("li").forEach((li) => {
      const parent = li.parentElement;
      if (!parent || !/^(UL|OL)$/.test(parent.tagName)) {
        pushStrukturFehler(
          li,
          `<li> ist falsch verschachtelt (erwartet direkt innerhalb von <ul> oder <ol>)`
        );
      }
    });

    // 3) Erkennung möglicher Fake-Lists aus <p>-Elementen
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
      <ul>
        <li>Strukturfehler: <strong>${strukturFehler.length}</strong></li>
        <li>Mögliche Fake-Listen: <strong>${fakeLists.length}</strong></li>
      </ul>
    `;

    if (strukturFehler.length > 0) {
      content += `<h4>Strukturfehler</h4><ul>`;
      strukturFehler.forEach((entry) => {
        content += `
          <li>
            <strong>${escapeHtml(entry.message)}</strong><br>
            Position: <code>${escapeHtml(entry.path)}</code>
          </li>
        `;
      });
      content += `</ul>`;
    } else {
      content += `<p>Keine Strukturfehler bei <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code> oder <code>&lt;li&gt;</code> gefunden.</p>`;
    }

    if (fakeLists.length > 0) {
      content += `<h4>Mögliche Fake-Listen</h4><ul>`;
      fakeLists.forEach((entry) => {
        const examplesHtml = entry.examples.length
          ? `<br>Listeneinträge: ${entry.examples.map((ex) => `"${escapeHtml(ex)}"`).join(", ")}`
          : "(keine Listeneinträge gefunden)";

        const cssInfo = entry.viaCssBefore
          ? ` (Aufzählungszeichen offenbar über <code>::before</code>)`
          : "";

        content += `
          <li>
            <strong>${examplesHtml}</strong><br>
            ${entry.count} aufeinanderfolgende <code>&lt;p&gt;</code>-Elemente wirken wie eine Liste${cssInfo}<br>
            Position: <code>${escapeHtml(entry.path)}</code>
          </li>
        `;
      });
      content += `</ul>`;
    } else {
      content += `<p>Keine offensichtlichen Fake-Listen aus <code>&lt;p&gt;</code>-Elementen gefunden.</p>`;
    }

    return {
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
      return `<ul>${items
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
        .join("")}</ul>`;
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
      title: "Autocomplete-Attribute prüfen",
      status: status,
      content: content
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
  return el.parentElement.outerHTML;
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

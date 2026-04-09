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
        ? "Alle Alt-Texte in Bildern sind befüllt."
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
  },

  pruefeDokumenttitel() { //1242
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
        content: "Kein Dokumenttitel vorhanden."
      };
    }

    if (titleText.length < 5) {
      score -= 40;
      fehler.push("Titel ist sehr kurz.");
    }

    if (titleText.length > 80) {
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
      fehler.push("Titel wirkt wie URL oder Dateiname.");
    }

    if (hasEmojiOrDecoration) {
      score -= 15;
      hinweise.push("Titel enthält dekorative Zeichen oder Emojis.");
    }

    if (hasManySpecials) {
      score -= 10;
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
      status = "neutral";
    }

    const parts = [`Gefundener Titel: "${titleText}".`, /*`Bewertung: ${score}/100.`*/''];
    if (fehler.length) { parts.push("Probleme: " + fehler.join(" ")); }
    if (hinweise.length) { parts.push("Hinweise: " + hinweise.join(" ")); }
    if (status === "pass") { parts.push("Der Titel wirkt sprechend, sinnvoll und sachlich formuliert."); }

    return {
      title: "Dokumenttitel prüfen",
      status,
      content: parts.join("<br>")
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
    let emptyIds = 0;

    elementsWithId.forEach((el) => {
      const id = el.getAttribute("id") || "";

      if (!id.trim()) {
        emptyIds++;
        return;
      }

      idMap.set(id, (idMap.get(id) || 0) + 1);
    });

    const duplicateIds = Array.from(idMap.entries()).filter(([, count]) => count > 1);
    const issueCount = duplicateIds.length + emptyIds;

    let status = "pass";
    if (issueCount > 0 /*&& issueCount <= 3) status = "neutral";
    if (issueCount > 3*/) status = "fail";

    let content = "Keine Probleme mit IDs gefunden.";

    if (issueCount > 0) {
      content =
        `Doppelte IDs: ${duplicateIds.length}, leere IDs: ${emptyIds}.`;
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
    if (affectedElements.length === 1) status = "neutral";
    if (affectedElements.length > 1) status = "fail";

    let content = "Keine doppelten Attribute gefunden.";

    if (affectedElements.length > 0) {
      content = `Elemente mit doppelten Attributen gefunden: ${affectedElements.length}.`;
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

        results.push(`${selector || "(node)"}: ${matches.join(" | ")}`);
      }
    });

    if (results.length === 0) {
      return {
        title: "CSS-Text in Pseudo-Elementen",
        status: "pass",
        content:
          'Kein per CSS eingebundener Text über "::before" oder "::after" mit mehr als 2 Zeichen gefunden.'
      };
    }

    return {
      title: "CSS-Text in Pseudo-Elementen",
      status: "fail",
      content:
        `Es wurden ${results.length} Element(e) mit per CSS eingebundenem Text gefunden:\n\n` +
        results.join("\n")
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
        status = "neutral";
        messages.push(
          `Nur ${presentCount} von 5 geprüften Landmarken wurden gefunden.`
        );
      }

      if (header && header.count === 0) {
        if (status === "pass") status = "neutral";
        messages.push("Kein seitenweiter <code>header</code> gefunden.");
      }

      if (footer && footer.count === 0) {
        if (status === "pass") status = "neutral";
        messages.push("Kein seitenweiter <code>footer</code> gefunden.");
      }

      if (nav && nav.visibleCount > 1 && nav.namedCount < nav.visibleCount) {
        if (status === "pass") status = "neutral";
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
    function selectorOf(el) {
      if (!el) return "(node)";
      let s = (el.tagName || "").toLowerCase();

      if (el.classList && el.classList.length) {
        s += "." + Array.from(el.classList).slice(0, 6).join(".");
      }

      if (el.id) {
        s += "#" + el.id;
      }

      return s || "(node)";
    }

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
          label: selectorOf(table),
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
          label: selectorOf(el),
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
            label: selectorOf(el),
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
            label: selectorOf(el),
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
          label: selectorOf(item.context),
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
        status: visibleTables.length ? "pass" : "neutral",
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
              <div style="padding:8px 0;border-top:1px solid #eee">
                <div><b>${index + 1}. ${escapeHtml(item.label)}</b></div>
                <div style="margin-top:6px;font-size:12px;color:#666">
                  Pfad: <code>${escapeHtml(item.path)}</code>
                </div>
                ${item.errors
                  .map(
                    (err) => `
                      <div style="margin-top:6px;font-size:12px;color:#b42318">
                        ${escapeHtml(err)}
                      </div>
                    `
                  )
                  .join("")}
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
    function selectorOf(el) {
      if (!el) return "(node)";
      let s = (el.tagName || "").toLowerCase();

      if (el.classList && el.classList.length) {
        s += "." + Array.from(el.classList).slice(0, 6).join(".");
      }

      if (el.id) {
        s += "#" + el.id;
      }

      return s || "(node)";
    }

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
            .map((el) => selectorOf(el))
            .join(", ")})`
        );
      }

      const idElements = [table, ...localTableElements(table, "[id]")].filter(
        (el, index, arr) => arr.indexOf(el) === index && el.hasAttribute("id")
      );

      if (idElements.length) {
        errors.push(
          `Transparente Tabelle darf kein Attribut "id" besitzen (${idElements
            .map((el) => selectorOf(el))
            .join(", ")})`
        );
      }

      if (errors.length) {
        issues.push({
          label: selectorOf(table),
          path: getDomPath(table),
          errors: [...new Set(errors)]
        });
      }
    });

    if (!issues.length) {
      return {
        title: "Visuell transparente Tabellen prüfen",
        status: transparentTables.length ? "pass" : "neutral",
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
              <div style="padding:8px 0;border-top:1px solid #eee">
                <div><b>${index + 1}. ${escapeHtml(item.label)}</b></div>
                <div style="margin-top:6px;font-size:12px;color:#666">
                  Pfad: <code>${escapeHtml(item.path)}</code>
                </div>
                ${item.errors
                  .map(
                    (err) => `
                      <div style="margin-top:6px;font-size:12px;color:#b42318">
                        ${escapeHtml(err)}
                      </div>
                    `
                  )
                  .join("")}
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
}

window.PageAnalyzerTests = tests;

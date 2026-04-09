// loader.js

(function () {
  const MAIN_JS_URL = "https://ceb640a6-cb7e-45e9-aaf2-fbaefc740186.github.io/019cfb6d-c100-7f9c-9735-18986e56a4eb/load/main.js?t="+Date.now();

  const selectedTests = [
    /* 1031 */ "headingsList",
    /* 1012 */ "imagesMissingAlt",
    /* 1013 */ "imagesEmptyAlt",
    /* 1244 */ "linksWithoutText",
    /* 1031 */ "oneH1",
    /* 1031 */ "headingJumps",
    /* 1242 */ "pruefeDokumenttitel",
    /* 1411 */ "checkIds",
    /* 1411 */ "checkDuplicateAttributes",
    /* 1034 */ "textFromCSS",
    /* 1241 */ "checkLandmarks",
    /* 6035 */ "pruefeSichtbareTabellen",
    /* 6035 */ "pruefeTransparenteTabellen",
    /* 1311 */ "pruefeLangAttribut",
    /* 8010 */ "findeKomplettLeereTags",
    /* 8020 */ "pruefeLinksImFliesstext",
    /* 1032 */ "pruefeListenStruktur"
  ].sort();

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.documentElement.appendChild(s);
    });
  }

  async function ensureMainLoaded() {
    if (window.PageAnalyzerTests) return;
    await loadScript(MAIN_JS_URL);

    if (!window.PageAnalyzerTests) {
      throw new Error("main.js loaded, but PageAnalyzerTests is not available.");
    }
  }

  function normalizeStatus(status) {
    return ["pass", "check", "fail", "neutral"].includes(status) ? status : "neutral";
  }

  function runTests(testNames) {
    const results = [];

    for (const name of testNames) {
      const fn = window.PageAnalyzerTests[name];

      if (typeof fn !== "function") {
        results.push({
          title: `Missing test: ${name}`,
          status: "fail",
          content: "This test name was configured in loader.js but not found in main.js."
        });
        continue;
      }

      try {
        const result = fn();

        results.push({
          title: result?.title || name,
          status: normalizeStatus(result?.status),
          content: result?.content || ""
        });
      } catch (err) {
        results.push({
          title: `Error in test: ${name}`,
          status: "fail",
          content: `<pre>${escapeHtml(err.message || String(err))}</pre>`
        });
      }
    }

    return results;
  }

  function getSummary(results) {
    return results.reduce(
      (acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      },
      { pass: 0, check: 0, fail: 0, neutral: 0 }
    );
  }

  function getBadgeLabel(status) {
    if (status === "pass") return "PASS";
    if (status === "check") return "CHECK";
    if (status === "fail") return "FAIL";
    return "NEUTRAL";
  }

  function openReport(results) {
    const summary = getSummary(results);

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    const html = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Page Analysis Report</title>
        <style>
          /*https://tailwindcss.com/docs/colors*/
          :root {
            --white: #f1f3f5;
            --lighter: #dee2e6;
            --light: #ced4da;
            --gray: #adb5bd;
            --dark: #868e96;
            --daker: #343a40;
            --black: #212529;

            --pass-white: #e6fcf5;
            --pass-light: #63e6be;
            --pass: #20c997;
            --pass-dark: #0ca678;
            --pass-black: #087f5b;

            --neutral-white: #f8f9fa;
            --neutral-light: #dee2e6;
            --neutral: #adb5bd;
            --neutral-dark: #495057;
            --neutral-black: #212529;
            
            --check-white: #fff9db;
            --check-light: #ffe066;
            --check: #fcc419;
            --check-dark: #f59f00;
            --check-black: #e67700;
            
            --fail-white: #fff0f6;
            --fail-light: #faa2c1;
            --fail: #f06595;
            --fail-dark: #d6336c;
            --fail-black: #a61e4d;
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 24px;
            background: var(--lighter);
            color: var(--black);
          }

          h1 {
            margin-top: 0;
            margin-bottom: 8px;
          }

          .meta {
            margin-bottom: 24px;
            color: var(--darker);
          }

          .summary {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .summary-box {
            background: white;
            border: 1px solid var(--light);
            border-radius: 8px;
            padding: 12px 16px;
            min-width: 120px;
          }

          .summary-pass {
            background: var(--pass-white);
            border: 3px solid var(--pass-dark);
          }

          .summary-fail {
            background: var(--fail-white);
            border: 3px solid var(--fail-dark);
          }

          .summary-neutral {
            background: var(--neutral-white);
            border: 3px solid var(--neutral-dark);
          }

          .summary-check {
            background: var(--check-white);
            border: 3px solid var(--check-dark);
          }

          .summary-box strong {
            display: block;
            font-size: 20px;
            margin-top: 4px;
          }

          .box {
            background: white;
            border: 3px solid var(--light);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }

          .box-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
          }

          .box h2 {
            margin: 0;
            font-size: 18px;
          }

          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.03em;
          }

          .badge-pass {
            background: var(--pass-dark);
            color: var(--pass-white);
          }

          .badge-fail {
            background: var(--fail-dark);
            color: var(--fail-white);
          }

          .badge-neutral {
            background: var(--neutral-dark);
            color: var(--neutral-white);
          }

          .badge-check {
            background: var(--check-dark);
            color: var(--check-white);
          }

          .box-pass {
            border-left: 7px solid var(--pass-dark);
          }

          .box-fail {
            border-left: 7px solid var(--fail-dark);
          }

          .box-neutral {
            border-left: 7px solid var(--neutral-dark);
          }

          .box-check {
            border-left: 7px solid var(--check-dark);
          }

          code, pre {
            background: var(--white);
            border-radius: 4px;
          }

          code {
            padding: 2px 4px;
          }

          pre {
            padding: 12px;
            overflow: auto;
          }

          ul {
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Page Analysis Report</h1>

        <div class="meta">
          <div class="metaUrl"><strong>URL:</strong> ${escapeHtml(location.href)}</div>
          <div class="metaDate"><strong>Generated:</strong> ${escapeHtml(new Date().toLocaleString())}</div>
          <div class="metaCount"><strong>Total tests:</strong> ${results.length}</div>
        </div>

        <div class="summary">
          <div class="summary-box summary-fail">
            Fail
            <strong>${summary.fail}</strong>
          </div>
          <div class="summary-box summary-check">
            Check
            <strong>${summary.check}</strong>
          </div>
          <div class="summary-box summary-neutral">
            Neutral
            <strong>${summary.neutral}</strong>
          </div>
          <div class="summary-box summary-pass">
            Pass
            <strong>${summary.pass}</strong>
          </div>
        </div>

        ${results.map(r => `
          <div class="box box-${r.status}">
            <div class="box-header">
              <h2>${escapeHtml(r.title)}</h2>
              <span class="badge badge-${r.status}">${getBadgeLabel(r.status)}</span>
            </div>
            <div class="box-content">${r.content}</div>
          </div>
        `).join("")}
      </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function init() {
    try {
      await ensureMainLoaded();
      const results = runTests(selectedTests);
      results.sort((a, b) => {
        const order = { fail: 0, check: 1, neutral: 2, pass: 3 };
        return order[a.status] - order[b.status];
      });
      openReport(results);
    } catch (err) {
      console.error("Page analyzer failed:", err);
      alert("Page analyzer failed: " + (err.message || String(err)));
    }
  }

  init();
})();

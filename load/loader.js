// loader.js

(function () {
  const MAIN_JS_URL = "https://ceb640a6-cb7e-45e9-aaf2-fbaefc740186.github.io/019cfb6d-c100-7f9c-9735-18986e56a4eb/load/main.js?t="+Date.now();

  const selectedTests = [
    "pageTitle",
    "headingsList",
    "imageCount",
    "imagesMissingAlt",
    "linksWithoutText",
    /* 1031 */ "oneH1",
    /* 1031 */ "headingJumps"
  ];

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
    return ["pass", "fail", "neutral"].includes(status) ? status : "neutral";
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
      { pass: 0, fail: 0, neutral: 0 }
    );
  }

  function getBadgeLabel(status) {
    if (status === "pass") return "PASS";
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
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 24px;
            background: #f5f5f5;
            color: #222;
          }

          h1 {
            margin-top: 0;
            margin-bottom: 8px;
          }

          .meta {
            margin-bottom: 24px;
            color: #555;
          }

          .summary {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .summary-box {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 16px;
            min-width: 120px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }

          .summary-pass {
            background: #d1fae5;
            border: 2px solid #065f46;
          }

          .summary-fail {
            background: #fee2e2;
            border: 2px solid #991b1b;
          }

          .summary-neutral {
            background: #e5e7eb;
            border: 2px solid #374151;
          }

          .summary-box strong {
            display: block;
            font-size: 20px;
            margin-top: 4px;
          }

          .box {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.03em;
          }

          .badge-pass {
            background: #d1fae5;
            color: #065f46;
          }

          .badge-fail {
            background: #fee2e2;
            color: #991b1b;
          }

          .badge-neutral {
            background: #e5e7eb;
            color: #374151;
          }

          .box-pass {
            border-left: 6px solid #065f46;
          }

          .box-fail {
            border-left: 6px solid #991b1b;
          }

          .box-neutral {
            border-left: 6px solid #374151;
          }

          code, pre {
            background: #f0f0f0;
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
          <div><strong>URL:</strong> ${escapeHtml(location.href)}</div>
          <div><strong>Generated:</strong> ${escapeHtml(new Date().toLocaleString())}</div>
          <div><strong>Total tests:</strong> ${results.length}</div>
        </div>

        <div class="summary">
          <div class="summary-box summary-pass">
            Pass
            <strong>${summary.pass}</strong>
          </div>
          <div class="summary-box summary-fail">
            Fail
            <strong>${summary.fail}</strong>
          </div>
          <div class="summary-box summary-neutral">
            Neutral
            <strong>${summary.neutral}</strong>
          </div>
        </div>

        ${results.map(r => `
          <div class="box box-${r.status}">
            <div class="box-header">
              <h2>${escapeHtml(r.title)}</h2>
              <span class="badge badge-${r.status}">${getBadgeLabel(r.status)}</span>
            </div>
            <div>${r.content}</div>
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
        const order = { fail: 0, neutral: 1, pass: 2 };
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

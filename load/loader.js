// loader.js

(function () {
  const MAIN_JS_URL = "https://myName.github.io/myRepo/main.js";

  const selectedTests = [
    "imgAlt",
    "formLabels",
    "pageTitle",
    "htmlLang",
    "skipLink",
    "linkText",
    "audioVideoManual",
    "keyboardManual",
    "meaningfulSequenceManual"
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
      throw new Error("main.js loaded, but PageAnalyzerTests was not found.");
    }
  }

  function runTests(names) {
    return names.map(name => {
      const fn = window.PageAnalyzerTests[name];

      if (typeof fn !== "function") {
        return {
          id: name,
          title: `Missing test: ${name}`,
          status: "fail",
          level: "A",
          criterion: "",
          content: "This test is configured in loader.js but not defined in main.js.",
          details: []
        };
      }

      try {
        return fn();
      } catch (err) {
        return {
          id: name,
          title: `Error in test: ${name}`,
          status: "fail",
          level: "A",
          criterion: "",
          content: `<pre>${escapeHtml(err.message || String(err))}</pre>`,
          details: []
        };
      }
    });
  }

  function getCounts(results) {
    return results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, { pass: 0, fail: 0, warn: 0, manual: 0 });
  }

  function badge(status) {
    const map = {
      pass: "PASS",
      fail: "FAIL",
      warn: "WARN",
      manual: "MANUAL"
    };
    return `<span class="badge badge-${status}">${map[status] || status}</span>`;
  }

  function renderDetails(details) {
    if (!details || !details.length) return "";
    return `
      <ul>
        ${details.map(d => `<li>${d}</li>`).join("")}
      </ul>
    `;
  }

  function openReport(results) {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    const counts = getCounts(results);

    const html = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Accessibility Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 24px;
            background: #f6f7f9;
            color: #1f2328;
            line-height: 1.5;
          }
          h1, h2, h3 { margin-top: 0; }
          .summary, .box {
            background: #fff;
            border: 1px solid #d0d7de;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(100px, 1fr));
            gap: 12px;
            margin-top: 12px;
          }
          .summary-item {
            border: 1px solid #d0d7de;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            background: #fafbfc;
          }
          .box-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
          }
          .meta {
            color: #57606a;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .badge {
            display: inline-block;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .03em;
          }
          .badge-pass { background: #dafbe1; color: #116329; }
          .badge-fail { background: #ffebe9; color: #cf222e; }
          .badge-warn { background: #fff8c5; color: #9a6700; }
          .badge-manual { background: #ddf4ff; color: #0969da; }
          code, pre {
            background: #f6f8fa;
            border-radius: 6px;
          }
          code { padding: 2px 4px; }
          pre { padding: 12px; overflow: auto; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="summary">
          <h1>Accessibility Report</h1>
          <div><strong>URL:</strong> ${escapeHtml(location.href)}</div>
          <div><strong>Title:</strong> ${escapeHtml(document.title || "(none)")}</div>
          <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>

          <div class="summary-grid">
            <div class="summary-item"><div>Pass</div><strong>${counts.pass}</strong></div>
            <div class="summary-item"><div>Fail</div><strong>${counts.fail}</strong></div>
            <div class="summary-item"><div>Warn</div><strong>${counts.warn}</strong></div>
            <div class="summary-item"><div>Manual</div><strong>${counts.manual}</strong></div>
          </div>
        </div>

        ${results.map(r => `
          <div class="box">
            <div class="box-header">
              <h2>${escapeHtml(r.title)}</h2>
              ${badge(r.status)}
            </div>
            ${r.criterion ? `<div class="meta">${escapeHtml(r.criterion)} · Level ${escapeHtml(r.level || "A")}</div>` : ""}
            <div>${r.content}</div>
            ${renderDetails(r.details)}
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
      openReport(results);
    } catch (err) {
      console.error(err);
      alert("Accessibility report failed: " + (err.message || String(err)));
    }
  }

  init();
})();

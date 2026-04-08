// loader.js

(function () {
  const MAIN_JS_URL = "https://myName.github.io/myRepo/main.js";

  // Choose which tests to run from main.js
  const selectedTests = [
    "pageTitle",
    "headingCount",
    "imagesMissingAlt",
    "linksWithoutText"
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

  function runTests(testNames) {
    const results = [];

    for (const name of testNames) {
      const fn = window.PageAnalyzerTests[name];

      if (typeof fn !== "function") {
        results.push({
          title: `Missing test: ${name}`,
          content: "This test name was configured in loader.js but not found in main.js."
        });
        continue;
      }

      try {
        const result = fn();

        results.push({
          title: result?.title || name,
          content: result?.content || ""
        });
      } catch (err) {
        results.push({
          title: `Error in test: ${name}`,
          content: `<pre>${escapeHtml(err.message || String(err))}</pre>`
        });
      }
    }

    return results;
  }

  function openReport(results) {
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
          }
          .meta {
            margin-bottom: 24px;
            color: #555;
          }
          .box {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }
          .box h2 {
            margin-top: 0;
            font-size: 18px;
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
          <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>

        ${results.map(r => `
          <div class="box">
            <h2>${escapeHtml(r.title)}</h2>
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
      openReport(results);
    } catch (err) {
      console.error("Page analyzer failed:", err);
      alert("Page analyzer failed: " + (err.message || String(err)));
    }
  }

  init();
})();

// loader.js

(function () {
  const MAIN_JS_URL = "https://ceb640a6-cb7e-45e9-aaf2-fbaefc740186.github.io/019cfb6d-c100-7f9c-9735-18986e56a4eb/load/main.js?t="+Date.now();

  const RESULTS_SORT_AtoZ = true;
  const RESULTS_SORT_FAILtoPASS = true;

  let selectedTests = [
    /* 1012 */ "imagesMissingAlt",
    /* 1013 */ "imagesEmptyAlt",
    /* 1244 */ "linksWithoutText",
      /* 1031 */ "oneH1",
      /* 1031 */ "checkHeadings",
    /* 1242 */ "pruefeDokumenttitel",
      /* 1411 */ "checkIds",
      /* 1411 */ "checkDuplicateAttributes",
    /* 1034 */ "textFromCSS",
    /* 1241 */ "checkLandmarks",
    /* 1035 */ "pruefeSichtbareTabellen",
    /* 1037 */ "pruefeTransparenteTabellen",
    /* 1311 */ "pruefeLangAttribut",
    /* 8010 */ "findeKomplettLeereTags",
    /* 1141 */ "pruefeLinksImFliesstext",
    /* 1032 */ "pruefeListenStruktur",
    /* 2135 */ "pruefeAutocompleteAttribute",
    /* 1253 */ "pruefeLabelInName",
    /* 1332 */ "pruefeFormularBeschriftungen",
    /* 1038 */ "pruefeBeschriftungenStrengWCAG",
    /* 1036 */ "checkThScope",
    /* 2146 */ "checkHorizontalScroll320"
  ];

  if (RESULTS_SORT_AtoZ) selectedTests = selectedTests.sort();

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
    return ["pass", "check", "fail"].includes(status) ? status : "check";
  }

  async function runTests(testNames) {
    const results = [];

    for (const name of testNames) {
      const fn = window.PageAnalyzerTests[name];

      if (typeof fn !== "function") {
        results.push({
          id: `Error`,
          reqLink: ['#', 'Error'],
          reqInfo: [`Test ${name} nicht gefunden`, `Betroffen: ${name}`],
          title: `Unbekannter Test: ${name}`,
          status: "crash",
          content: "This test name was configured in loader.js but not found in main.js."
        });
        continue;
      }

      try {
        const result = await fn();

        results.push({
          id: result?.id || name,
          reqLink: result?.reqLink || ['https://bitvtest.de/pruefverfahren/bitv-20-web', 'Weitere Prüfschritte anzeigen'],
          reqInfo: result?.reqInfo || ['', ''],
          title: result?.title || name,
          status: normalizeStatus(result?.status),
          content: result?.content || ""
        });
      } catch (err) {
        results.push({
          id: `Error`,  
          reqLink: ['', 'Error'],
          reqInfo: [`${err.name} im Test`, `${name}: <code>${err.name || 'Unbekannter Fehler'}</code>`],
          title: `${err.name} in test: ${name}`,
          status: "crash",
          content: `<pre>${escapeHtml(err.toString() || String(err))}</pre><pre>${escapeHtml(err.stack || err)}</pre>`
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
      { pass: 0, check: 0, fail: 0, crash: 0 }
    );
  }

  function getBadgeLabel(status) {
    if (status === "pass") return "PASS";
    if (status === "check") return "CHECK";
    if (status === "fail") return "FAIL";
    if (status === "crash") return "CRASH";
    return "CHECK";
  }

  function openReport(results) {
    const summary = getSummary(results);

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    const ratingTotal = (summary.fail + summary.pass);
    const totalRating = summary.pass / ratingTotal;
    let ratingColor = 'pass';
    if (totalRating <= 0.7) ratingColor = 'check';
    if (totalRating <= 0.4) ratingColor = 'fail';
    const ratingOutput = (totalRating*100).toFixed(0);

    const html = `
      <!doctype html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <title>Page Analysis Report</title>
          <style>
            :root {
                --gray-0: #fff;
                --gray-50: #fbfbfb;
                --gray-100: #f3f3f4;
                --gray-200: #e6e6e8;
                --gray-300: #d2d4d8;
                --gray-400: #b6b8c1;
                --gray-500: #969aa8;
                --gray-600: #7e8293;
                --gray-700: #696c7a;
                --gray-800: #52545e;
                --gray-900: #3b3c42;
                --gray-950: #262629;
                --gray-970: #1b1b1d;
                --gray-990: #151516;
                --gray-999: #000;

                --info-50: #fbfbfc;
                --info-100: #f1f4f6;
                --info-200: #dfe7ef;
                --info-300: #c2d5e8;
                --info-400: #95b9e2;
                --info-500: #629adc;
                --info-600: #417fd0;
                --info-700: #3668ad;
                --info-800: #32507e;
                --info-900: #2a3a53;
                --info-950: #1d2532;
                --info-970: #161a21;
                --info-990: #121418;

                --pass-50: #fbfcfb;
                --pass-100: #f1f6f4;
                --pass-200: #dfefe9;
                --pass-300: #c2e8db;
                --pass-400: #95e2c9;
                --pass-500: #63dcb8;
                --pass-600: #41d0a7;
                --pass-700: #37ac8d;
                --pass-800: #327e6b;
                --pass-900: #2a534a;
                --pass-950: #1d322d;
                --pass-970: #17211f;
                --pass-990: #121817;

                --check-50: #fcfcfa;
                --check-100: #f7f7f0;
                --check-200: #f1f0dc;
                --check-300: #efe8bb;
                --check-400: #efdc88;
                --check-500: #f0ca4e;
                --check-600: #e8b129;
                --check-700: #c08a23;
                --check-800: #8b6325;
                --check-900: #5a4123;
                --check-950: #35281a;
                --check-970: #231c15;
                --check-990: #191511;

                --fail-50: #fcfbfb;
                --fail-100: #f6f1f2;
                --fail-200: #f0dee3;
                --fail-300: #ebbfcd;
                --fail-400: #e790ac;
                --fail-500: #e45b8a;
                --fail-600: #d93872;
                --fail-700: #b42f61;
                --fail-800: #832d4f;
                --fail-900: #56273a;
                --fail-950: #331c26;
                --fail-970: #22161b;
                --fail-990: #181215;

                --crash-50: #fbfbfc;
                --crash-100: #f3f1f6;
                --crash-200: #e4dfef;
                --crash-300: #cfc2e8;
                --crash-400: #ad95e2;
                --crash-500: #8762dc;
                --crash-600: #6941d0;
                --crash-700: #5636ad;
                --crash-800: #45327e;
                --crash-900: #332a53;
                --crash-950: #221d32;
                --crash-970: #191621;
                --crash-990: #131218;
            }

            * {
                padding: 0;
                margin: 0;
            }

            body {
                font-family: Arial, sans-serif;
                line-height: 1.5;
                margin: 0;
                padding: 30px 20px;
                background: var(--gray-200);
                color: var(--gray-970);

                margin: 0;
                font-family: "Segoe UI", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
                background: var(--gray-50);
                color: var(--gray-990);
                line-height: 1.55;
            }

            h1 {
                margin-top: 0;
                margin-bottom: 8px;
                font-size: 1.5rem;
                font-weight: 600;
            }

            h2 {
                font-size: 1.25rem;
                font-weight: 600;
            }

            strong {
                font-weight: 600;
            }

            a {
                color: var(--info-600);
            }

            ol,
            ul {
                padding-left: 30px;
            }

            li {
                padding: 4px 10px;
                border: 1px solid var(--gray-400);
                border-bottom-width: 3px;
                margin-top: 10px;
                border-radius: 4px;
                box-shadow: 0 0 8px var(--gray-200);
            }

            img {
                border-radius: 4px;
                border: 1px solid var(--gray-300);
                margin: 5px 5px 5px 0;
            }

            button,
            input {
                font-family: "Segoe UI", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            }

            button {
                background: var(--gray-200);
                color: var(--gray-970);
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid var(--gray-400);
                font-weight: 500;
            }

            button:hover {
                background: var(--gray-50);
            }

            .content {
                max-width: 1300px;
                margin: 0 auto;
            }

            .highlight-temp {
                border: 2px solid var(--fail-600);
                box-shadow: 0 0 10px var(--fail-500);
                border-radius: 4px;
            }

            .meta {
                margin-bottom: 24px;
                color: var(--gray-900);
            }

            .summary {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 24px;
                flex-direction: column;
            }

            .summary-box {
                background: white;
                border: 1px solid var(--gray-300);
                border-radius: 8px;
                padding: 12px 16px;
                min-width: 120px;
            }

            .summary-pass {
                background: var(--pass-100);
                color: var(--pass-970);
                border: 3px solid var(--pass-600);
            }

            .summary-check {
                background: var(--check-100);
                color: var(--check-970);
                border: 3px solid var(--check-600);
            }

            .summary-fail {
                background: var(--fail-100);
                color: var(--fail-970);
                border: 3px solid var(--fail-600);
            }

            .summary-crash {
                background: var(--crash-100);
                color: var(--crash-970);
                border: 3px solid var(--crash-600);
            }

            .summary-box strong {
                display: block;
                font-size: 20px;
                margin-top: 4px;
            }

            .box {
                background: white;
                border: 2px solid var(--gray-400);
                margin-bottom: 10px;
                box-shadow: 0 0 5px #0001;
                transition: all 0.2s;
            }

            details[open].box {
                margin-bottom: 30px;
                box-shadow: 0 0 5px #0003;
                transition: all 0.2s;
            }

            .box summary,
            .box-content {
                padding: 10px 10px 10px 16px;
            }

            .box-content summary {
                color: var(--info-600);
            }

            summary {
                background: #00000007;
            }

            details {
                border: 1px solid var(--gray-400);
                border-radius: 6px;
            }

            summary {
                border-radius: 3px;
            }

            details[open]>summary {
                border-bottom: 1px solid var(--gray-400);
                border-radius: 3px 3px 0 0;
            }

            details>.box-content {
                height: 0;
                transition: all 0.3s;
            }

            details[open]>.box-content {
                height: auto;
                transition: all 0.3s;
            }

            .reqHr {
                border: none;
                border-top: 2px dashed var(--gray-500);
                margin: 10px 0;
            }

            summary:hover {
                background: #0001;
            }

            .box-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
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
                background: var(--pass-200);
                color: var(--pass-700);
            }

            .badge-check {
                background: var(--check-200);
                color: var(--check-700);
            }

            .badge-fail {
                background: var(--fail-200);
                color: var(--fail-700);
            }

            .badge-crash {
                background: var(--crash-200);
                color: var(--crash-700);
            }

            .box-pass {
                border-left: 5px solid var(--pass-600);
            }

            .box-check {
                border-left: 5px solid var(--check-600);
            }

            .box-fail {
                border-left: 5px solid var(--fail-600);
            }

            .box-crash {
                border-left: 5px solid var(--crash-600);
            }

            .box-pass .box-header {
                background: var(--pass-50);
                color: var(--pass-970);
            }

            .box-check .box-header {
                background: var(--check-50);
                color: var(--check-970);
            }

            .box-fail .box-header {
                background: var(--fail-50);
                color: var(--fail-970);
            }

            .box-crash .box-header {
                background: var(--crash-50);
                color: var(--crash-970);
            }

            .box-pass .box-header:hover {
                background: var(--pass-200);
            }

            .box-check .box-header:hover {
                background: var(--check-200);
            }

            .box-fail .box-header:hover {
                background: var(--fail-200);
            }

            .box-crash .box-header:hover {
                background: var(--crash-200);
            }

            code,
            pre {
                background: var(--gray-50);
                border: 1px solid var(--gray-200);
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

            td {
                padding: 10px;
            }

            .clonedElement {
                user-select: none;
                display: inline-block;
                pointer-events: none;
                background: var(--gray-50);
                border-radius: 6px;
                border: 3px solid var(--gray-200);
                padding: 5px 10px;
                box-shadow: 5px 5px 15px var(--gray-200);
                margin: 0 10px 10px 0;
            }

            summary::marker,
            summary::-webkit-details-marker {
                list-style: none;
                display: none;
            }

            summary {
                list-style: none;
            }

            details>summary .toggleText {
                margin: 0;
                padding-left: 20px;
                position: relative;
            }

            /*https://symbolonly.com/arrow-symbols.html*/
            details>summary .toggleText::before {
                content: '⮞ ';
                /*⮞ᐅᐳ▶▸*/
                position: absolute;
                font-weight: 900;
                left: 0;
                top: 0;
                color: var(--gray-600);
                transition: all 0.2s;
            }

            details[open]>summary .toggleText::before {
                /*⮟ᐁᐯ▼▾*/
                /*content: '▶ ';
                position: absolute;
                left: 0;
                top: 0;
                color: var(--gray-600);*/
                top: 0.05rem;
                transform: rotate(90deg);
                transition: all 0.2s;
            }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Page Analysis Report</h1>
          <div class="meta">
            <div class="metaUrl"><strong>URL:</strong> <a href="${escapeHtml(location.href)}" target="_blank">${escapeHtml(location.href)}</a></div>
            <div class="metaDate"><strong>Generated:</strong> ${escapeHtml(new Date().toLocaleString())}</div>
            <div class="metaCount"><strong>Total tests:</strong> ${results.length}</div>
          </div>
          
          <table>
            <tr>
              <td>
                <div class="summary">
                  ${summary.crash > 0 ? `
                  <div class="summary-box summary-crash">
                    Crash
                    <strong>${summary.crash}</strong>
                  </div>` : ''}
                  <div class="summary-box summary-fail">
                    Fail
                    <strong>${summary.fail}</strong>
                  </div>
                  <div class="summary-box summary-check">
                    Check
                    <strong>${summary.check}</strong>
                  </div>
                  <div class="summary-box summary-pass">
                    Pass
                    <strong>${summary.pass}</strong>
                  </div>
                </div>
              </td>
              <td>
                <canvas id="summary-chart" width="350" height="350"></canvas>
              </td>
            </tr>
          </table>
          
          <h2>Total Score: <span style="color:var(--${ratingColor}-black); background:var(--${ratingColor}-white); padding: 0 4px; border-radius: 6px">${ratingOutput}%</span></h2>

          <button onclick="openBoxes()">Alle Tests ausklappen</button>
          <button onclick="closeBoxes()">Alle Tests zuklappen</button><br>
          <button onclick="openBoxes('-fail')">Fail ausklappen</button>
          <button onclick="closeBoxes('-fail')">Fail zuklappen</button><br>
          <button onclick="openBoxes('-check')">Check ausklappen</button>
          <button onclick="closeBoxes('-check')">Check zuklappen</button><br>
          <button onclick="openBoxes('-pass')">Pass ausklappen</button>
          <button onclick="closeBoxes('-pass')">Pass zuklappen</button><br>
              
          ${results.map(r => `<details class="box box-${r.status}" id="${r.uuid}" ${r.status == 'pass' ? '' : 'open'}>
            <summary class="box-header">
              <h2 class="toggleText">${escapeHtml(r.title)}</h2>
              <span class="badge badge-${r.status}">${getBadgeLabel(r.status)}</span>
            </summary>
            <div class="box-content details-content">
              <div class="resultContent">
                ${r.content}
              </div>
              <button class="popupButton removeInPopup" onclick="openPopup(this, '${escapeHtml(r.title)}')">Open in popup</button>
              <hr class="reqHr">
              <details class="reqirementDetails">
                <summary>
                  <p class="toggleText">Weitere Infos zur Anforderung</p>
                </summary>
                <div class="inline-content details-content">
                  <div class="reqInfo">
                    <p><strong>${escapeHtml(r.reqInfo[0])}</strong><br>
                      ${escapeHtml(r.reqInfo[1])}<br>
                      <a class="reqLink" href="${escapeHtml(r.reqLink[0])}" target="_blank">${escapeHtml(r.reqLink[1])}</a><br>
                      <span class="reqId">Projektinterne ID: ${escapeHtml(r.id)}</span>
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </details>
        `).join("")}
        </div>

        <script>
        function openPopup(button, docTitle) {
            const details = button.closest('details.box');
            const clone = details.cloneNode(true);
            clone.querySelectorAll('.removeInPopup').forEach(el => el.remove()); /*remove cloned popup button*/
            clone.setAttribute("open", "true");

            let styles = "";
            document.querySelectorAll("style").forEach(styleTag => {
              styles += styleTag.outerHTML;
            });

            const popup = window.open("", "_blank", "width=700,height=400");
            popup.document.write(\`
              <html>
                <head>
                  <title>\$\{docTitle\} – Popup</title>
                  \$\{styles\}
                </head>
                <body>
                  \$\{clone.outerHTML\}
                </body>
              </html>
            \`);

            popup.document.close();
          }
        </script>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          function openBoxes(scope = '') {
            document.querySelectorAll('details.box' + scope).forEach(el => el.setAttribute('open', ''));
          }
          
          function closeBoxes(scope = '') {
            document.querySelectorAll('details.box' + scope).forEach(el => el.removeAttribute('open'));
          }

          const ctx = document.getElementById('summary-chart').getContext('2d');
          const data = {
            labels: [${summary.crash > 0 ? `'Crash',` : ''} 'Pass', 'Check', 'Fail'],
            datasets: [{
              label: 'Testfälle',
              data: [${summary.crash > 0 ? `${summary.crash},` : ''} ${summary.pass}, ${summary.check}, ${summary.fail}],
              backgroundColor: [
                ${summary.crash > 0 ? `'#845ef7',` : ''}
                '#20c997', // pass
                '#fcc419', // check
                '#f06595' // fail
              ],
              borderColor: [
                ${summary.crash > 0 ? `'#ffffff00',` : ''}
                '#ffffff00',
                '#ffffff00',
                '#ffffff00',
              ],
              borderWidth: 2
            }]
          };

          const config = {
            type: 'doughnut',
            data: data,
            options: {
              responsive: false,
              plugins: {
                legend: {
                  position: 'right',
                },
                tooltip: {
                  enabled: true
                }
              }
            }
          };

          new Chart(ctx, config);
        </script>
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

  /*function getRootVar(cssVar) {
    return window.getComputedStyle(document.body).getPropertyValue(cssVar);
  }*/

  async function init() {
    try {
      await ensureMainLoaded();
      const results = await runTests(selectedTests);
      if (RESULTS_SORT_FAILtoPASS) {
        results.sort((a, b) => {
          const order = { crash: 0, fail: 1, check: 2, pass: 3 };
          return order[a.status] - order[b.status];
        });
      }
      results.forEach(obj => obj.uuid = crypto.randomUUID());
      openReport(results);
    } catch (err) {
      console.error("Page analyzer failed:", err);
      alert("Page analyzer failed: " + (err.message || String(err)));
    }
  }

  init();
})();
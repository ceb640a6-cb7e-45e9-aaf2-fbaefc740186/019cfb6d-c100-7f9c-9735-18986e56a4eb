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
    /* 8020 */ "pruefeLinksImFliesstext",
    /* 1032 */ "pruefeListenStruktur",
    /* 2135 */ "pruefeAutocompleteAttribute",
    /* 1253 */ "pruefeLabelInName",
    /* 1332 */ "pruefeFormularBeschriftungen",
    /* 1038 */ "pruefeBeschriftungenStrengWCAG"
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

  function runTests(testNames) {
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
        const result = fn();

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
          /*https://tailwindcss.com/docs/colors*/
          :root {
            --white: #f1f3f5;
            --lighter: #dee2e6;
            --light: #ced4da;
            --gray: #adb5bd;
            --dark: #868e96;
            --daker: #343a40;
            --black: #212529;

            --link-white: #e7f5ff;
            --link-light: #74c0fc;
            --link: #339af0;
            --link-dark: #1c7ed6;
            --link-black: #1864ab;

            --pass-white: #e6fcf5;
            --pass-light: #63e6be;
            --pass: #20c997;
            --pass-dark: #0ca678;
            --pass-black: #087f5b;
            
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
            
            --crash-white: #f3f0ff;
            --crash-light: #b197fc;
            --crash: #845ef7;
            --crash-dark: #7048e8;
            --crash-black: #5f3dc4;
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 30px 20px;
            background: var(--lighter);
            color: var(--black);
          }

          h1 {
            margin-top: 0;
            margin-bottom: 8px;
          }

          a {
            color: var(--link-dark);
          }

          ol, ul {
            padding-left: 30px;
          }

          li {
            padding: 4px 10px;
            border: 1px solid var(--gray);
            border-bottom-width: 5px;
            margin-top: 5px;
            border-radius: 4px;
            box-shadow: 0 0 8px var(--lighter);
          }

          img {
            border-radius: 4px;
            border: 1px solid var(--light);
            margin: 5px 5px 5px 0;
          }

          .content {
            max-width: 1300px;
            margin: 0 auto;
          }

          .highlight-temp {
            border: 2px solid var(--fail-dark);
            box-shadow: 0 0 10px var(--fail);
            border-radius: 4px;
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
            flex-direction: column;
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

          .summary-check {
            background: var(--check-white);
            border: 3px solid var(--check-dark);
          }

          .summary-fail {
            background: var(--fail-white);
            border: 3px solid var(--fail-dark);
          }

          .summary-crash {
            background: var(--crash-white);
            border: 3px solid var(--crash-dark);
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

          .badge-check {
            background: var(--check-dark);
            color: var(--check-white);
          }

          .badge-fail {
            background: var(--fail-dark);
            color: var(--fail-white);
          }

          .badge-crash {
            background: var(--crash-dark);
            color: var(--crash-white);
          }

          .box-pass {
            border-left: 7px solid var(--pass-dark);
            linear-gradient(90deg,var(--pass-white) 0%, var(--white) 3%);
          }

          .box-check {
            border-left: 7px solid var(--check-dark);
            linear-gradient(90deg,var(--check-white) 0%, var(--white) 3%);
          }

          .box-fail {
            border-left: 7px solid var(--fail-dark);
            linear-gradient(90deg,var(--fail-white) 0%, var(--white) 3%);
          }

          .box-crash {
            border-left: 7px solid var(--crash-dark);
            linear-gradient(90deg,var(--check-white) 0%, var(--white) 3%);
          }

          code, pre {
            background: var(--white);
            border: 1px solid var(--lighter);
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
            background: var(--white);
            border-radius: 6px;
            border: 3px solid var(--lighter);
            padding: 5px 10px;
            box-shadow: 5px 5px 15px var(--lighter);
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

          details > summary .toggleText {
            padding-left: 20px;
            position: relative;
          }

          /*https://symbolonly.com/arrow-symbols.html*/
          details > summary .toggleText::before {
            content: 'ᐳ '; /*⮞ᐅᐳ*/
            position: absolute;
            left: 0;
            top: 0;
            color: var(--dark);
          }

          details[open] > summary .toggleText::before {
            content: 'ᐯ '; /*⮟ᐁᐯ*/
            position: absolute;
            left: 0;
            top: 0;
            color: var(--dark);
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
            <div class="box-content">
              <div class="resultContent">
                ${r.content}
              </div>
              <button class="popupButton removeInPopup" onclick="openPopup(this, '${escapeHtml(r.title)}')">Open in popup</button>
                <details style="padding: 0 10px; margin-top: 10px; border: 2px solid var(--${r.status}-black); border-radius: 4px">
                  <summary>
                    <p class="toggleText">Weitere Infos zur Anforderung</p>
                  </summary>
                  <div class="reqInfo">
                    <p><strong>${escapeHtml(r.reqInfo[0])}</strong><br>
                      ${escapeHtml(r.reqInfo[1])}<br>
                      <a class="reqLink" href="${escapeHtml(r.reqLink[0])}" target="_blank">${escapeHtml(r.reqLink[1])}</a><br>
                      <span class="reqId">Projektinterne ID: ${escapeHtml(r.id)}</span>
                    </p>
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
      const results = runTests(selectedTests);
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
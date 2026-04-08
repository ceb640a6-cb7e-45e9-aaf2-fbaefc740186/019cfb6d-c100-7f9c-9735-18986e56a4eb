/*javascript:*/(async function () {
  const baseUrl = "https://ceb640a6-cb7e-45e9-aaf2-fbaefc740186.github.io/019cfb6d-c100-7f9c-9735-18986e56a4eb/";
  const files = ["headings.js", "links.js"];
  const results = [];

  window.PageChecks = window.PageChecks || {};

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src + "?t=" + Date.now();
      s.onload = resolve;
      s.onerror = () => reject(new Error("Fehler beim Laden: " + src));
      document.documentElement.appendChild(s);
    });
  }

  function getCheckName(file) {
    return file.replace(/\.js$/, "");
  }

  try {
    for (const file of files) {
      const url = baseUrl + file;
      await loadScript(url);

      const checkName = getCheckName(file);
      const fn = window.PageChecks[checkName];

      if (typeof fn !== "function") {
        results.push({
          title: file,
          result: "Keine passende Funktion gefunden"
        });
        continue;
      }

      const output = await fn();
      results.push(output);
    }

    const newTab = window.open("", "_blank");
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Analyseergebnisse</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; }
          .block { margin-bottom: 24px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }
          h2 { margin-top: 0; }
        </style>
      </head>
      <body>
        <h1>Analyseergebnisse</h1>
        ${results.map(r => `
          <div class="block">
            <h2>${r.title}</h2>
            <div>${r.result}</div>
          </div>
        `).join("")}
      </body>
      </html>
    `;

    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();
  } catch (err) {
    alert("Fehler: " + err.message);
  }
})();

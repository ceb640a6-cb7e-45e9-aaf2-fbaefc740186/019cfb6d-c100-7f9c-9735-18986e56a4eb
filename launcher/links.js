window.PageChecks = window.PageChecks || {};

window.PageChecks.links = async function () {
  const links = document.querySelectorAll("a[href]");
  return {
    title: "Links",
    result: `Anzahl Links: ${links.length}`
  };
};

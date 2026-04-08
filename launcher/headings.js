window.PageChecks = window.PageChecks || {};

window.PageChecks.headings = async function () {
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  return {
    title: "Überschriften",
    result: `Anzahl Überschriften: ${headings.length}`
  };
};

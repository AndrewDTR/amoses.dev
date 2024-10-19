(function () {
  const tooltip = document.getElementById("tooltip");

  document.addEventListener("mouseover", function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === "a") {
      const href = target.getAttribute("href");

      const link = document.createElement("a");
      link.href = href || "";

      if (link.hostname && link.hostname !== location.hostname) {
        const displayHostname = link.hostname.replace(/^www\./, "");

        tooltip.textContent = displayHostname;
        tooltip.style.display = "block";
        tooltip.style.left = event.pageX + 10 + "px";
        tooltip.style.top = event.pageY + 10 + "px";
      }
    }
  });

  document.addEventListener("mouseout", function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === "a") {
      tooltip.style.display = "none";
    }
  });

  document.addEventListener("mousemove", function (event) {
    if (tooltip.style.display === "block") {
      tooltip.style.left = event.pageX + 3 + "px";
      tooltip.style.top = event.pageY - 25 + "px";
    }
  });
})();

(() => {
  const $ = (id) => document.getElementById(id);
  const toast = (message) => {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  };

  $("expandAll").addEventListener("click", () => {
    const sections = [...document.querySelectorAll("section:not(.hide)")];
    const shouldClose = sections.some((section) => !section.classList.contains("closed"));
    sections.forEach((section) => section.classList.toggle("closed", shouldClose));
    $("expandAll").textContent = shouldClose ? "Expand all" : "Collapse all";
  });

  $("focus").addEventListener("click", () => {
    document.body.classList.toggle("focus-mode");
    $("focus").textContent = document.body.classList.contains("focus-mode") ? "Exit focus" : "Focus mode";
  });

  $("reset").addEventListener("click", () => {
    if (!confirm("Reset every solved problem?")) return;
    document.querySelectorAll("tr[data-id] input:checked").forEach((checkbox) => checkbox.click());
    toast("Progress reset");
  });

  $("export").addEventListener("click", () => {
    const data = localStorage.getItem("dsa_sheet_done") || "{}";
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dsa-sheet-progress.json";
    link.click();
    URL.revokeObjectURL(link.href);
    toast("Progress exported");
  });

  $("import").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("Invalid format");
      localStorage.setItem("dsa_sheet_done", JSON.stringify(imported));
      location.reload();
    } catch (error) {
      toast("Could not import that file");
    }
    event.target.value = "";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement.tagName !== "INPUT") {
      event.preventDefault();
      $("q").focus();
    }
    if (event.key === "Escape" && document.activeElement === $("q")) {
      $("q").value = "";
      $("q").dispatchEvent(new Event("input"));
      $("q").blur();
    }
  });
})();

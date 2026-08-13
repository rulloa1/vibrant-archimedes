(() => {
  const filters = [...document.querySelectorAll("#filters [data-f]")];
  const tiles = [...document.querySelectorAll("#grid .tile")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lbImg");
  const lightboxCaption = document.getElementById("lbCap");
  const closeButton = document.getElementById("lbClose");
  let previousFocus = null;

  const closeLightbox = () => {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    document.body.style.overflow = "";
    previousFocus?.focus();
  };

  const openLightbox = (tile) => {
    previousFocus = document.activeElement;
    const title = tile.dataset.title || "Project image";
    const subtitle = tile.dataset.sub || "";
    lightboxImage.src = tile.dataset.img || tile.querySelector("img")?.src || "";
    lightboxImage.alt = title;
    lightboxCaption.textContent = subtitle ? `${title} — ${subtitle}` : title;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.f;
      filters.forEach((item) => item.classList.toggle("active", item === filter));
      tiles.forEach((tile) => {
        const visible = category === "all" || tile.dataset.cat === category;
        tile.classList.toggle("hide", !visible);
        tile.setAttribute("aria-hidden", String(!visible));
      });
    });
  });

  tiles.forEach((tile) => {
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", `View ${tile.dataset.title || "project"}`);
    tile.addEventListener("click", () => openLightbox(tile));
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(tile);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
})();

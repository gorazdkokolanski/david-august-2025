// script.js

const folders = document.querySelectorAll(".folder");

folders.forEach(folder => {
  let isDragging = false;
  let dragStarted = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;

  function startDrag(e) {
    // track starting point
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    dragStarted = false;

    // listen for movement
    document.addEventListener("mousemove", dragCheck);
    document.addEventListener("touchmove", dragCheck, { passive: false });

    document.addEventListener("mouseup", stopDragCheck);
    document.addEventListener("touchend", stopDragCheck);
  }

  // check if user actually starts dragging
  function dragCheck(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    if (!dragStarted && Math.abs(dx) + Math.abs(dy) > 5) {
      // start dragging only if movement > 5px
      dragStarted = true;
      isDragging = true;

      // remove class from all, then add to current
      folders.forEach(f => f.classList.remove("dragging"));
      folder.classList.add("dragging");

      const rect = folder.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
    }
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    folder.style.left = `${clientX - offsetX}px`;
    folder.style.top = `${clientY - offsetY}px`;
    folder.style.position = "absolute";
  }

  function stopDragCheck() {
    document.removeEventListener("mousemove", dragCheck);
    document.removeEventListener("touchmove", dragCheck);
    document.removeEventListener("mouseup", stopDragCheck);
    document.removeEventListener("touchend", stopDragCheck);

    if (isDragging) {
      isDragging = false;
      dragStarted = false;

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
    }
  }

  // prevent navigation if dragged
  folder.addEventListener("click", function (e) {
    if (dragStarted) {
      e.preventDefault();
    }
  });

  folder.addEventListener("mousedown", startDrag);
  folder.addEventListener("touchstart", startDrag, { passive: false });
});

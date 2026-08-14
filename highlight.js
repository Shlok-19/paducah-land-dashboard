// Selected-parcel highlighting for the Paducah Land Acquisition Dashboard.
(function () {
  function applySelectionHighlight() {
    const visible = filtered();
    const parcelPaths = Array.from(svg.querySelectorAll('.parcel'));
    const outlines = Array.from(svg.querySelectorAll('.outline'));

    parcelPaths.forEach((path, index) => {
      const parcel = visible[index];
      const isSelected = parcel && parcel.id === selected;

      // Keep every non-selected parcel at its normal appearance.
      path.style.opacity = '1';
      path.style.fillOpacity = isSelected ? '0.78' : '0.38';
      path.style.stroke = isSelected ? '#ffd400' : '#ffffff';
      path.style.strokeWidth = isSelected ? '9px' : '4px';
      path.style.filter = isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,.75))' : 'none';

      const outline = outlines[index];
      if (outline) {
        outline.style.opacity = '1';
        outline.style.stroke = isSelected ? '#ffd400' : (COLORS[parcel?.status] || COLORS.Pending);
        outline.style.strokeWidth = isSelected ? '5px' : '2.2px';
      }
    });

    document.querySelectorAll('.card').forEach(card => {
      const isSelected = card.dataset.id === selected;
      card.style.outline = isSelected ? '3px solid #ffd400' : 'none';
      card.style.outlineOffset = isSelected ? '-1px' : '0';
      card.style.background = isSelected ? '#fff8d6' : '#fff';
      card.style.boxShadow = isSelected ? '0 0 0 2px rgba(17,34,61,.18), 0 7px 16px rgba(20,35,55,.14)' : '';
    });
  }

  const originalRenderVectors = renderVectors;
  renderVectors = function () {
    originalRenderVectors();
    applySelectionHighlight();
  };

  const originalCloseDrawer = closeDrawer;
  closeDrawer = function () {
    originalCloseDrawer();
    renderVectors();
  };

  ['close', 'cancel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => setTimeout(renderVectors, 0));
  });

  renderVectors();
})();

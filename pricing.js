// Pricing summary and parcel price register for the Paducah Land Acquisition Dashboard.
(function () {
  const money = n => '$' + Number(n || 0).toLocaleString(undefined, {maximumFractionDigits: 0});
  const money2 = n => '$' + Number(n || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const parcelTotal = p => Number(p.acres || 0) * Number(p.pricePerAcre || 0);

  // Inject pricing-specific styles without changing the base dashboard stylesheet.
  const style = document.createElement('style');
  style.textContent = `
    .kpi.site-price{grid-column:1/-1;background:#fffaf0;border-color:#ead9b8}
    .kpi.site-price .value{font-size:18px;color:#7d5a20;overflow-wrap:anywhere}
    .price-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;padding-top:7px;border-top:1px solid #edf0f3}
    .price-box{font-size:9px;color:#6f7b89;text-transform:uppercase;font-weight:800;letter-spacing:.03em}
    .price-box strong{display:block;margin-top:2px;color:#11223d;font-size:11px;text-transform:none;letter-spacing:0}
    .price-unset strong{color:#8a949f;font-weight:650}
    #fParcelTotal[readonly]{background:#f7f9fb;color:#11223d;font-weight:800}
  `;
  document.head.appendChild(style);

  const kpis = document.querySelector('.kpis');
  if (kpis && !document.getElementById('kSitePrice')) {
    const box = document.createElement('div');
    box.className = 'kpi site-price';
    box.innerHTML = '<div class="label">Total Site Price</div><div class="value" id="kSitePrice">$0</div>';
    kpis.appendChild(box);
  }

  const heading = document.querySelector('.listhead h2');
  if (heading) heading.textContent = 'Land & Price Register';

  const fPrice = document.getElementById('fPrice');
  if (fPrice && !document.getElementById('fParcelTotal')) {
    const form = document.createElement('div');
    form.className = 'form';
    form.innerHTML = '<label>Total Parcel Price ($)</label><input id="fParcelTotal" type="text" readonly>';
    fPrice.closest('.form').insertAdjacentElement('afterend', form);
  }

  function updateDrawerTotal() {
    const total = document.getElementById('fParcelTotal');
    if (!total) return;
    const acres = Number(document.getElementById('fAcres')?.value || 0);
    const perAcre = Number(document.getElementById('fPrice')?.value || 0);
    total.value = money2(acres * perAcre);
  }

  document.getElementById('fPrice')?.addEventListener('input', updateDrawerTotal);
  document.getElementById('fAcres')?.addEventListener('input', updateDrawerTotal);

  function enhancePricingDisplay() {
    const totalSite = parcels.reduce((sum, p) => sum + parcelTotal(p), 0);
    const k = document.getElementById('kSitePrice');
    if (k) k.textContent = money(totalSite);

    document.querySelectorAll('.card').forEach(card => {
      const p = parcels.find(x => x.id === card.dataset.id);
      if (!p) return;
      let row = card.querySelector('.price-row');
      if (!row) {
        row = document.createElement('div');
        row.className = 'price-row';
        card.appendChild(row);
      }
      const hasPrice = p.pricePerAcre !== '' && p.pricePerAcre !== null && p.pricePerAcre !== undefined && Number(p.pricePerAcre) !== 0;
      row.innerHTML = `
        <div class="price-box ${hasPrice ? '' : 'price-unset'}">Price / Acre<strong>${hasPrice ? money2(p.pricePerAcre) : 'Not set'}</strong></div>
        <div class="price-box ${hasPrice ? '' : 'price-unset'}">Parcel Total<strong>${hasPrice ? money(parcelTotal(p)) : 'Not set'}</strong></div>`;
    });
    updateDrawerTotal();
  }

  const originalRefreshPricing = refresh;
  refresh = function () {
    originalRefreshPricing();
    enhancePricingDisplay();
  };

  const originalOpenParcelPricing = openParcel;
  openParcel = function (id, zoomTo) {
    originalOpenParcelPricing(id, zoomTo);
    updateDrawerTotal();
  };

  function exportPricingCSV() {
    const h = ['Owner','Acres','Status','Price / Acre','Parcel Total Price','Current Position','Next Action','Notes','Last Updated'];
    const r = parcels.map(p => [p.owner,p.acres,p.status,p.pricePerAcre,parcelTotal(p),p.currentPosition,p.nextAction,p.notes,p.lastUpdated]);
    download('Paducah_Land_Price_Register.csv',[h,...r].map(x=>x.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv');
  }
  const csv = document.getElementById('csv');
  if (csv) csv.onclick = exportPricingCSV;

  enhancePricingDisplay();
})();

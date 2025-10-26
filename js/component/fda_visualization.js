(function(){
  // Vanilla JS implementation of the React FDAVisualization component
  // Uses ApexCharts for chart rendering (already included in index.html)

  function $(sel, root=document) { return root.querySelector(sel); }
  function create(tag, props) {
    const el = document.createElement(tag);
    if (props) Object.assign(el, props);
    return el;
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

  window.FDAVisualization = function(container) {
    this.container = container;
    this.data = [];
    this.loading = false;
    this.chartType = 'bar';

    this.init();
  };

  FDAVisualization.prototype.init = function() {
    const card = create('div');
    card.className = 'fda-card';
    card.style.padding = '24px';
    card.style.borderRadius = '12px';
    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
    card.style.background = 'linear-gradient(90deg, rgba(79,140,255,0.05), rgba(124,58,237,0.04))';

    const header = create('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';

    const titleWrap = create('div');
    const h2 = create('h2'); h2.textContent = 'FDA Adverse Event Reports'; h2.style.margin = '0 0 6px 0'; h2.style.fontSize = '18px';
    const p = create('p'); p.textContent = 'Top reported adverse drug reactions'; p.style.margin = 0; p.style.color = '#6b7280';
    titleWrap.appendChild(h2); titleWrap.appendChild(p);

    const controls = create('div'); controls.style.display = 'flex'; controls.style.gap = '8px'; controls.style.alignItems = 'center';

    // Chart type select
    const select = create('select');
    ['bar','line','pie'].forEach(opt => { const o = create('option'); o.value = opt; o.text = opt.charAt(0).toUpperCase()+opt.slice(1)+' Chart'; select.appendChild(o); });
    select.value = this.chartType;
    select.style.padding = '8px'; select.style.borderRadius='8px'; select.style.border='1px solid #dbeafe';
    select.addEventListener('change', (e)=>{ this.chartType = e.target.value; this.renderChart(); });

  // Refresh button (lucide icon)
  const refreshBtn = create('button');
  refreshBtn.title = 'Refresh';
  refreshBtn.className = 'icon-btn';
  refreshBtn.style.padding='8px'; refreshBtn.style.borderRadius='8px'; refreshBtn.style.border='1px solid #dbeafe'; refreshBtn.style.background='#fff';
  const refreshIcon = create('i'); refreshIcon.setAttribute('data-lucide','rotate-cw'); refreshBtn.appendChild(refreshIcon);
  refreshBtn.addEventListener('click', ()=>this.fetchFDAData());

  // Export button (lucide icon)
  const exportBtn = create('button'); exportBtn.title = 'Export CSV'; exportBtn.className = 'icon-btn';
  exportBtn.style.padding='8px'; exportBtn.style.borderRadius='8px'; exportBtn.style.border='1px solid #dbeafe'; exportBtn.style.background='#fff';
  const downloadIcon = create('i'); downloadIcon.setAttribute('data-lucide','download'); exportBtn.appendChild(downloadIcon);
  exportBtn.addEventListener('click', ()=>this.handleExport());

  controls.appendChild(select); controls.appendChild(refreshBtn); controls.appendChild(exportBtn);
  // replace lucide icons
  if (window.lucide && lucide.replace) { lucide.replace(); }

    header.appendChild(titleWrap); header.appendChild(controls);
    card.appendChild(header);

    // Chart area
    const chartWrap = create('div'); chartWrap.className = 'fda-chart-wrap'; chartWrap.style.borderRadius='10px'; chartWrap.style.padding='12px'; chartWrap.style.background='linear-gradient(90deg,#eef6ff,#fbf5ff)'; card.appendChild(chartWrap);
    const chartEl = create('div'); chartEl.id = 'fda-viz-chart'; chartEl.style.width='100%'; chartEl.style.height='420px'; chartWrap.appendChild(chartEl);

    // Stats grid
    const stats = create('div'); stats.style.display='grid'; stats.style.gridTemplateColumns='repeat(4,1fr)'; stats.style.gap='12px'; stats.style.marginTop='16px';
    this.statEls = [];
    for (let i=0;i<4;i++){ const s = create('div'); s.style.padding='12px'; s.style.borderRadius='8px'; s.style.background='rgba(255,255,255,0.6)'; s.style.textAlign='center'; stats.appendChild(s); this.statEls.push(s); }
    card.appendChild(stats);

    this.container.appendChild(card);
    this.chartEl = chartEl;
    this.fetchFDAData();
  };

  FDAVisualization.prototype.fetchFDAData = function(){
    const self = this;
    this.setLoading(true);
    // fetch top reactions as example
    fetch('https://api.fda.gov/drug/event.json?count=patient.reaction.reactionmeddrapt.exact&limit=10')
      .then(r=>r.json())
      .then(result=>{
        if (result.results) {
          const formatted = result.results.map(item=>({ term: item.term.length>20?item.term.substring(0,20)+'...':item.term, count: item.count, fullTerm: item.term }));
          self.data = formatted;
        } else {
          self.data = [
            { term: 'Nausea', count: 45623 },{ term: 'Headache', count: 38492 },{ term: 'Fatigue', count: 32154 },{ term: 'Dizziness', count: 28763 },{ term: 'Pain', count: 25891 },{ term: 'Vomiting', count: 22456 },{ term: 'Rash', count: 19234 },{ term: 'Anxiety', count: 16789 }
          ];
        }
      })
      .catch(err=>{
        console.error('Error fetching FDA data',err);
        self.data = [
          { term: 'Nausea', count: 45623 },{ term: 'Headache', count: 38492 },{ term: 'Fatigue', count: 32154 },{ term: 'Dizziness', count: 28763 },{ term: 'Pain', count: 25891 },{ term: 'Vomiting', count: 22456 },{ term: 'Rash', count: 19234 },{ term: 'Anxiety', count: 16789 }
        ];
      })
      .finally(()=>{ self.setLoading(false); self.renderChart(); self.renderStats(); });
  };

  FDAVisualization.prototype.setLoading = function(v){ this.loading = v; };

  FDAVisualization.prototype.renderChart = function(){
    if (this.loading) {
      this.chartEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><div style="width:48px;height:48px;border-radius:50%;border-bottom:4px solid #3b82f6;animation:spin 1s linear infinite"></div></div>';
      return;
    }
    const data = this.data;
    if (!data || data.length===0) { this.chartEl.innerHTML = '<div style="padding:24px;text-align:center;color:#666">No data</div>'; return; }

    if (this.chartInstance) { try { this.chartInstance.destroy(); } catch(e){} }

    if (this.chartType === 'bar'){
      const options = {
        series: [{ data: data.map(d=>d.count) }],
        chart: { type: 'bar', height: 420 },
        plotOptions: { bar: { horizontal: true, borderRadius: 8 } },
        xaxis: { categories: data.map(d=>d.term) },
        colors: [COLORS[0]],
        dataLabels: { enabled: false }
      };
      this.chartInstance = new ApexCharts(this.chartEl, options);
      this.chartInstance.render();
    } else if (this.chartType === 'line'){
      const options = {
        series: [{ name: 'Reports', data: data.map(d=>d.count) }],
        chart: { type: 'line', height: 420 },
        xaxis: { categories: data.map(d=>d.term) },
        stroke: { curve: 'smooth', width: 3 },
        colors: [COLORS[1]]
      };
      this.chartInstance = new ApexCharts(this.chartEl, options);
      this.chartInstance.render();
    } else if (this.chartType === 'pie'){
      const options = {
        series: data.map(d=>d.count),
        chart: { type: 'pie', height: 420 },
        labels: data.map(d=>d.term),
        colors: COLORS
      };
      this.chartInstance = new ApexCharts(this.chartEl, options);
      this.chartInstance.render();
    }
  };

  FDAVisualization.prototype.renderStats = function(){
    const sum = this.data.reduce((s,i)=>s+i.count,0);
    const dataPoints = this.data.length;
    this.statEls[0].innerHTML = '<p style="color:#3b82f6;margin:0 0 6px 0">Total Reports</p><div style="font-weight:700">'+sum.toLocaleString()+"</div>";
    this.statEls[1].innerHTML = '<p style="color:#7c3aed;margin:0 0 6px 0">Data Points</p><div style="font-weight:700">'+dataPoints+'</div>';
    this.statEls[2].innerHTML = '<p style="color:#ec4899;margin:0 0 6px 0">Top Reaction</p><div style="font-weight:700">'+(this.data[0]?.term||'N/A')+'</div>';
    this.statEls[3].innerHTML = '<p style="color:#f59e0b;margin:0 0 6px 0">Source</p><div style="font-weight:700">openFDA</div>';
  };

  FDAVisualization.prototype.handleExport = function(){
    const csv = 'Term,Count\n' + this.data.map(d=>`${d.term.replace(/,/g,'')},${d.count}`).join('\n');
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const link = document.createElement('a'); link.href = uri; link.download = 'fda_data.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // expose attach function
  window.attachFDAVisualization = function(parent){ const wrap = create('div'); parent.appendChild(wrap); new FDAVisualization(wrap); };

})();

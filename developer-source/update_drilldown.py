from pathlib import Path
p=Path('selection-preview.js');s=p.read_text(encoding='utf-8')
s=s.replace("let selectedSummaryGroup='region';", "let selectedSummaryGroup='region',selectedSummaryFilter=null;")
s=s.replace('function selectedSummaryTable(sheet,repeated=false)', 'function selectedSummaryTable(sheet,repeated=false,kind=null)')
s=s.replace('${E(rs[0][0])}</th>', '${kind?`<button class="summary-drill" data-summary-name="${E(rs[0][0])}" data-summary-kind="${kind}" aria-pressed="${selectedSummaryFilter?.kind===kind&&selectedSummaryFilter?.name===rs[0][0]}" aria-controls="selected-drilldown">${E(rs[0][0])}<span>선택 사업 ${N(rs[0][1])}건 보기 →</span></button>`:E(rs[0][0])}</th>')
s=s.replace('ps.map(p=>p.id),selectedSummaryGroup]', 'ps.map(p=>p.id),selectedSummaryGroup,selectedSummaryFilter]')
s=s.replace("${selectedSummaryTable(sheets[selectedSummaryGroup==='region'?1:2])}</section>", "<p class=\"summary-click-help\">권역 또는 부처 이름을 누르면 해당하는 선택 사업만 아래에 펼쳐집니다.</p>${selectedSummaryTable(sheets[selectedSummaryGroup==='region'?1:2],false,selectedSummaryGroup)}<div id=\"selected-drilldown\">${selectedDrilldown(ps)}</div></section>")
s=s.replace("selectedSummaryGroup=b.dataset.summaryGroup;", "selectedSummaryGroup=b.dataset.summaryGroup;selectedSummaryFilter=null;")
s+='''
function selectedDrilldownProjects(ps,filter,records){
 if(!filter)return [];
 const ids=new Set(records.filter(r=>r.label===filter.name).map(r=>r.id));
 return [...new Map(ps.filter(p=>filter.kind==='region'?(p.region||'권역 미기재')===filter.name:ids.has(p.id)).map(p=>[p.id,p])).values()];
}
function selectedDrilldown(ps){
 if(!selectedSummaryFilter)return '';
 const f=selectedSummaryFilter,rows=selectedDrilldownProjects(ps,f,ministryRows);
 return `<section class="selected-drill-panel" aria-labelledby="selected-drill-title"><div class="summary-heading"><div><small>현재 선택한 사업 안에서만 보기</small><h3 id="selected-drill-title" tabindex="-1">${E(f.name)} · 선택 사업 ${N(rows.length)}건</h3></div><button data-summary-close>목록 닫기</button></div><p>전체 선택 ${N(ps.length)}건 중 ${N(rows.length)}건입니다. 아래 목록을 여는 것은 선택이나 엑셀 다운로드 범위를 바꾸지 않습니다.</p><div class="selected-drill-grid">${rows.map(p=>`<article class="selected-drill-project"><small>${E(p.region)} · ${E(p.id)}</small><h4><a href="${link(p,'graph')}">${E(p.title)} →</a></h4><p>원문 근거 ${N(p.source_count)}개 · ${E(p.detail_match||'상세서 연결 미확인')}</p><p class="source-meta">공개자료 확인: ${E(p.public_status||'미확인')}</p><details><summary>원문 부처 표기·연결 근거</summary>${f.kind==='ministry'?ministryRows.filter(r=>r.id===p.id&&r.label===f.name).map(r=>`<p><b>${r.origin==='summary'?'요약서':'상세서'}</b> ${E(r.raw)}</p><small>${E(r.source)} · ${E(r.location)} · 근거 ${E(r.evidence||'미기재')}</small>`).join(''):`<p>요약서: ${E(p.summary_ministry||'미기재')}</p><p>상세서: ${E(p.detail_ministry||'미기재')}</p>`}</details><a class="button" href="${link(p,'graph')}">원문 근거·확인 수준 보기 →</a></article>`).join('')||'<p class="empty">현재 선택한 사업 중 이 항목에 해당하는 사업이 없습니다.</p>'}</div></section>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-summary-name],[data-summary-close]');if(!b)return;
 if(b.hasAttribute('data-summary-close')){selectedSummaryFilter=null;refreshSelectedSummary();document.querySelector('[data-summary-group][aria-pressed=true]')?.focus();return}
 selectedSummaryFilter={kind:b.dataset.summaryKind,name:b.dataset.summaryName};refreshSelectedSummary();const title=document.querySelector('#selected-drill-title');title?.focus({preventScroll:true});title?.scrollIntoView({behavior:'smooth',block:'start'});
});
'''
p.write_text(s,encoding='utf-8')
a=Path('dist/app.js');v=a.read_text(encoding='utf-8');start=v.index("let selectedSummaryGroup=");end=v.index('const selectionKey=',start);a.write_text(v[:start]+s+'\n'+v[end:],encoding='utf-8')
with Path('dist/style.css').open('a',encoding='utf-8') as f:f.write('''
.summary-drill{border:0;background:transparent;color:#245b59;text-align:left;padding:5px 0;font:inherit;font-weight:700;cursor:pointer}.summary-drill span{display:block;font-size:12px;font-weight:400;margin-top:5px}.summary-drill:hover{text-decoration:underline}.summary-drill[aria-pressed=true]{color:#8c5917}.summary-drill:focus-visible{outline:3px solid #c58c28;outline-offset:4px}.selected-drill-panel{border-top:2px solid #cbdcda;margin-top:24px;padding-top:24px}.selected-drill-panel h3{scroll-margin-top:28px;margin:8px 0}.selected-drill-panel>p{font-size:13px;color:#617078}.selected-drill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.selected-drill-project{border:1px solid #dce5e4;border-radius:12px;padding:20px;background:#fbfdfd;overflow-wrap:anywhere}.selected-drill-project h4{font-size:17px;line-height:1.6;margin:10px 0}.selected-drill-project p,.selected-drill-project details{font-size:13px;line-height:1.7}.selected-drill-project details{margin:14px 0}.selected-drill-project small{color:#617078}.selected-drill-project .button{margin-top:14px}.summary-click-help{color:#245b59!important}@media(max-width:850px){.selected-drill-grid{grid-template-columns:1fr}}
''')

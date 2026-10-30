from pathlib import Path
p=Path('selection-view.js');s=p.read_text(encoding='utf-8')
s=s.replace('refreshSelectedSummary()}', "refreshSelectedSummary();document.querySelectorAll('[data-export-drill]').forEach(el=>el.disabled=exportBusy||!selectedDrilldownProjects(D.projects.filter(p=>selectedProjects.has(p.id)),selectedSummaryFilter,ministryRows).length);document.querySelectorAll('[data-drill-export-status]').forEach(el=>el.textContent=exportStatus)}",1)
s=s.replace("async function exportSelection(){if(exportBusy||!selectedProjects.size)return;const ps=D.projects.filter(p=>selectedProjects.has(p.id)),withSources=includeExportSources;", "async function exportSelection(scope=null){if(exportBusy||!selectedProjects.size)return;const selected=D.projects.filter(p=>selectedProjects.has(p.id)),ps=scope?selectedDrilldownProjects(selected,scope,ministryRows):selected,withSources=scope?true:includeExportSources;if(!ps.length)return;")
s=s.replace("const sheets=selectionSheets(ps,packets,withSources);exportStatus=", "const sheets=selectionSheets(ps,packets,withSources);if(scope)sheets.find(s=>s.name==='읽기안내').rows.push(['내보내기 범위',(scope.kind==='region'?'권역':'원문 부처 표기')+': '+scope.name+' · 다운로드 버튼을 누른 시점의 펼친 선택 사업 '+ps.length+'건'],['부처별 요약 범위','이 파일에 담긴 사업에 연결된 모든 원문 부처 표기를 집계합니다. 눌렀던 부처만으로 제한하지 않습니다.'],['근거 포함 범위','펼친 사업만 내보내기에는 원문·공개 근거와 확인 수준이 항상 포함됩니다.']);exportStatus=")
s=s.replace("a.download=`선택사업_${ps.length}건_", "a.download=`${scope?'펼친사업_'+(scope.kind==='region'?'권역':'부처')+'_'+scope.name.replace(/[\\\\/:*?\"<>|]/g,'_'):'선택사업'}_${ps.length}건_")
s=s.replace("exportStatus=`${ps.length}개 사업의 엑셀 다운로드", "exportStatus=`${scope?scope.name+' · 펼친 사업 ':''}${ps.length}개 사업의 엑셀 다운로드")
p.write_text(s,encoding='utf-8')
p=Path('selection-preview.js');v=p.read_text(encoding='utf-8')
v=v.replace('<button data-summary-close>목록 닫기</button>', '<div class="actions"><button class="primary" data-export-drill ${exportBusy||!rows.length?\'disabled\':\'\'}>펼친 ${N(rows.length)}개 사업만 엑셀 ↓</button><button data-summary-close>목록 닫기</button></div>')
v=v.replace('아래 목록을 여는 것은 선택이나 엑셀 다운로드 범위를 바꾸지 않습니다.</p>', '이곳의 다운로드 버튼은 펼친 사업만 담습니다. 전체 선택은 유지됩니다.</p><p>요약·원문 근거·공개자료·확인 수준을 항상 함께 넣습니다. 부처별 요약은 해당 사업에 연결된 모든 원문 부처 표기를 포함합니다.</p><p data-drill-export-status role="status">${E(exportStatus)}</p>')
v+='''
document.addEventListener('click',e=>{if(!e.target.closest('[data-export-drill]')||!selectedSummaryFilter)return;e.preventDefault();exportSelection({...selectedSummaryFilter})});
'''
p.write_text(v,encoding='utf-8')
p=Path('dist/app.js');a=p.read_text(encoding='utf-8');start=a.index('let selectedSummaryGroup=');end=a.index('new MutationObserver(attachSelectionControls)',start);end=a.index('refreshSelection();',end)+len('refreshSelection();');p.write_text(a[:start]+v+'\n'+s+a[end:],encoding='utf-8')

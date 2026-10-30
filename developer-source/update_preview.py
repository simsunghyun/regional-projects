from pathlib import Path
p=Path('selection-view.js');s=p.read_text(encoding='utf-8')
s=s.replace("el.disabled=!n||exportBusy)}", "el.disabled=!n||exportBusy);refreshSelectedSummary()}")
s=s.replace("heading('선택 사업 내려받기','선택한 사업만 모아 엑셀로 내려받습니다. 다른 화면에서 담은 사업도 여기에 함께 표시됩니다.')", "heading('선택 사업 요약·내려받기','선택한 사업의 권역별·부처별 사업 수와 예산을 확인하고, 같은 요약을 엑셀로 내려받습니다.')")
s=s.replace('</div><div class="notice">항상 포함:', '</div><div id="selected-summary" aria-live="polite"></div><div class="notice">항상 포함:')
p.write_text(s,encoding='utf-8')
a=Path('dist/app.js');v=a.read_text(encoding='utf-8');start=v.index('const selectionKey=');end=v.index('new MutationObserver(attachSelectionControls)',start);end=v.index('refreshSelection();',end)+len('refreshSelection();');a.write_text(v[:start]+Path('selection-preview.js').read_text(encoding='utf-8')+'\n'+s+v[end:],encoding='utf-8')
css='''
/* Selected projects: on-screen summaries use the Excel aggregation. */
.selection-summary{padding:24px;margin:22px 0}.summary-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.summary-heading h2{margin:0}.summary-heading>span,.selection-summary>p{color:var(--muted,#617078);font-size:14px}.selection-summary-table{min-width:920px;width:100%}.selection-summary-table th:first-child{min-width:180px}.selection-summary-table th[scope=row]{text-align:left;font-size:14px;font-weight:600}.selection-summary-table td{vertical-align:top}.selection-summary-table td strong{font-size:18px;font-variant-numeric:tabular-nums}.selection-summary-table small{display:block;color:#617078}.summary-known,.summary-pending{display:block;white-space:nowrap;font-size:12px;margin-top:6px;color:#617078}.summary-pending.has-pending{color:#925311;background:#fff4df;border-radius:5px;padding:4px 6px}.summary-explainer{font-size:13px;line-height:1.75;margin-top:18px;color:#53626b}.summary-explainer p{margin:6px 0}.summary-switch{display:flex;gap:8px}.summary-switch button[aria-pressed=true]{background:#245b59;color:white;border-color:#245b59}.summary-switch button:focus-visible{outline:3px solid #c58c28;outline-offset:3px}@media(max-width:650px){.selection-summary{padding:16px}.summary-heading{align-items:flex-start}.selection-summary .table-wrap{margin-top:16px}}
'''
with Path('dist/style.css').open('a',encoding='utf-8') as f:f.write(css)

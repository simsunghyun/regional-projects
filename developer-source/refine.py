from pathlib import Path
p=Path(__file__).parent/'dist/app.js'
s=p.read_text(encoding='utf8')
s=s.replace(' · ${E(a.unit)}</h3>', ' · 원문 단위: ${E(a.unit)}</h3><p class="subtle">아래 환산 금액: 억원 · 원문 행은 원래 단위 유지</p>')
s=s.replace('function record(obj){', '''Object.assign(labels,{detail_match:'상세서 연결 방식',summary_period:'요약서 기간',detail_period:'상세서 기간',summary_total:'요약서 총액 (억원)',detail_total:'상세서 총액 (억원)',total_delta:'총액 차이 (억원)',total_difference_band:'총액 차이 구간',summary_ministry:'요약서 부처',detail_ministry:'상세서 부처',ministry_source:'부처 표기 근거',placeholder_lines:'임시 표기 행 수',placeholder_source:'임시 표기 근거',summary_location:'요약서 위치',detail_location:'상세서 위치',known_whole:'전체 사업비 숫자 있음 (1/0)',known_window:'기간 투자액 숫자 있음 (1/0)',known_national:'기간 국비 숫자 있음 (1/0)',annual_rows:'연도 행 수',annual_valid_rows:'대조 가능 연도 행 수',annual_years:'기재 연도',annual_partial_total:'확인 연도 부분합 (억원)',annual_partial_national:'확인 연도 국비 부분합 (억원)',annual_national_rows:'국비 기재 연도 행 수',annual_invalid_rows:'대조 제한 연도 행 수',annual_arithmetic_difference_rows:'산술차이 연도 행 수',annual_source:'연도표 근거',annual_limitation:'연도표 확인 범위',tag:'검출 용어',pattern:'검출 규칙',meaning:'의미',scope:'범위'});
function record(obj){''')
s=s.replace('자료별 read level을 표시합니다.','자료별 열람 수준을 표시합니다.')
# A skip link focuses main without replacing the route.
s=s.replace("document.querySelector('#region-nav').innerHTML", "document.querySelector('.skip').onclick=e=>{e.preventDefault();main.focus()};document.querySelector('#region-nav').innerHTML")
p.write_text(s,encoding='utf8')
css=Path(__file__).parent/'dist/style.css'
with css.open('a',encoding='utf8') as f:
 f.write('\n.graph-controls{grid-template-columns:minmax(0,1fr) auto auto;align-items:end}.graph-controls button{height:43px}.graph-node text{font-size:18px}.graph-node.center text{font-size:13px}.graph-inspector .evidence-card{padding:15px}.graph-hint{bottom:60px}@media(max-width:680px){.graph-controls{grid-template-columns:1fr 1fr}.graph-controls label{grid-column:1/-1}.graph-node text{font-size:21px}}\n')

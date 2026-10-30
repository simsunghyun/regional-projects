from pathlib import Path
import re, shutil, json
root=Path(__file__).parent/'dist'
p=root/'index.html';s=p.read_text(encoding='utf8')
s=s.replace('<aside id="sidebar">','<aside id="sidebar"><a class="committee-brand" href="https://www.balance.go.kr/base/main/view" target="_blank" rel="noopener noreferrer"><img src="assets/committee-logo.svg" alt="대통령직속 지방시대위원회" width="228" height="60"></a>')
s=s.replace('<img src="favicon.svg" alt="" width="38" height="38">','')
s=s.replace('<span class="pill neutral">v0.6</span>','<img class="committee-mobile" src="assets/committee-logo.svg" alt="지방시대위원회" width="228" height="60">')
s=s.replace('v0.6 ','').replace('analysis-v0.6.xlsx','project-analysis.xlsx')
s=s.replace('데이터와 확인 기준 ↗</a></footer>','데이터와 확인 기준 ↗</a><a href="https://www.balance.go.kr/base/contents/view?contentsNo=8&amp;menuLevel=2&amp;menuNo=31" target="_blank" rel="noopener noreferrer">위원회 CI 출처 ↗</a></footer>')
p.write_text(s,encoding='utf8')
p=root/'app.js';s=p.read_text(encoding='utf8').replace(' · V0.6','').replace('v0.6에 남아 있는','분석표에 기재된').replace('v0.6 기재값','원자료의 기재값').replace('v0.6 ','').replace('analysis-v0.6.xlsx','project-analysis.xlsx');p.write_text(s,encoding='utf8')
old=root/'downloads/analysis-v0.6.xlsx';new=root/'downloads/project-analysis.xlsx'
shutil.move(str(old),str(new))
with (root/'style.css').open('a',encoding='utf8') as f:f.write('''
.committee-brand{display:block;margin:0 0 23px;padding-bottom:22px;border-bottom:1px solid var(--line)}.committee-brand img{display:block;width:100%;height:auto;max-width:228px}.brand{margin-bottom:25px;padding-left:10px}.committee-mobile{display:none}footer{flex-wrap:wrap;gap:14px}footer>a:first-of-type{margin-left:auto}
@media(max-width:680px){.committee-mobile{display:block;width:135px;height:auto}.topbar #breadcrumb{max-width:115px;font-size:10px}.topbar-right{gap:0}.committee-brand{margin-top:5px}.topbar{gap:8px}}
''')
(root/'assets/committee-logo-source.json').write_text(json.dumps({'source':'https://www.balance.go.kr/template/resources/images/global/logo.svg','official_ci_page':'https://www.balance.go.kr/base/contents/view?contentsNo=8&menuLevel=2&menuNo=31','retrieved':'2026-10-30','modification':'none'},ensure_ascii=False,indent=2),encoding='utf8')
assert not re.search(r'v0\.6',s,re.I)
assert not re.search(r'v0\.6',(root/'index.html').read_text(encoding='utf8'),re.I)
print('Official logo added; visible version labels and workbook filename updated.')

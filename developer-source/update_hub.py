from pathlib import Path
import re,json,collections
root=Path(__file__).parent;dist=root/'dist'
cat=json.loads((dist/'data/catalog.js').read_text(encoding='utf8')[len('window.REGION_DATA='):-1])
pattern=re.search(r"minpat=r'([^']+)'",(root/'prepare_data.py').read_text(encoding='utf8')).group(1)
rows=[]
for p in cat['projects']:
 for origin in ['summary','detail']:
  raw=p[origin+'_ministry'] or ''
  for label in dict.fromkeys(re.findall(pattern,raw)):
   rows.append(dict(id=p['id'],label=label,origin=origin,raw=raw,source=p[origin+'_source'],location=p[origin+'_location'],evidence=p['ministry_evidence'] if origin=='detail' else '',detail_match=p['detail_match'] if origin=='detail' else '요약서 기재'))
assert all(r['label'] in r['raw'] for r in rows)
assert len({(r['id'],r['label'],r['origin']) for r in rows})==len(rows)
(dist/'data/ministry-index.js').write_text('window.MINISTRY_INDEX='+json.dumps(rows,ensure_ascii=False,separators=(',',':')).replace('</','<\/')+';',encoding='utf8')
p=dist/'index.html';s=p.read_text(encoding='utf8').replace('<script defer src="app.js">','<script defer src="data/ministry-index.js"></script><script defer src="app.js">');s=s.replace('<a href="#graph" data-nav="graph">','<a href="#explore" data-nav="explore"><span>▦</span> 권역·부처별 사업</a><a href="#graph" data-nav="graph">');p.write_text(s,encoding='utf8')
p=dist/'app.js';s=p.read_text(encoding='utf8');s=s.replace('let serial=0;', (root/'hub-view.js').read_text(encoding='utf8')+'\nlet serial=0;')
s=s.replace("else if(name==='projects')", "else if(name==='explore')explore(new URLSearchParams(q));else if(name==='projects')")
s=s.replace("overview:'전체 개요',projects:","overview:'전체 개요',explore:'권역·부처별 연결 사업',projects:")
s=s.replace('#projects?region=${encodeURIComponent(r.region)}',"${hubLink('region',r.region)}")
s=s.replace('<div class="atlas-toolbar">','<div class="actions"><a class="button" href="#explore">권역·부처에서 연결 사업 찾기 →</a></div>${projectConnections(p)}<div class="atlas-toolbar">')
s=s.replace("if(k==='record')return `${pill('원문 기재')}","if(k==='record')return `${projectConnections(p)}${pill('원문 기재')}")
s=s.replace('<h1>${E(p.title)}</h1><div class="tags">','<h1>${E(p.title)}</h1>${projectConnections(p)}<div class="tags">')
p.write_text(s,encoding='utf8')
with (dist/'style.css').open('a',encoding='utf8') as f:f.write('''
.connection-chips{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.connection-chips a{font-size:12px;color:#426e80;background:#edf4f5;border:1px solid #d8e6e9;border-radius:6px;padding:7px 10px}.connection-chips a:hover{background:#dfeef1}.connection-chips small{font-size:10px;margin-left:4px}.hub-switch{display:flex;gap:10px}.hub-source{max-width:260px;margin-bottom:20px}.hub-layout{display:grid;grid-template-columns:210px minmax(0,1fr);gap:24px;align-items:start}.hub-picker{background:white;border:1px solid var(--line);border-radius:12px;padding:18px;position:sticky;top:20px;max-height:80vh;overflow:auto}.hub-picker h2{font-size:17px;margin-bottom:16px}.hub-picker input{font-size:12px;padding:8px}#hub-names{margin-top:14px}#hub-names a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border-radius:6px;font-size:13px;border:1px solid transparent;margin:3px 0}#hub-names a[hidden]{display:none}#hub-names a.active{background:#edf4f5;border-color:#c9dde0;color:#356e7a;font-weight:bold}#hub-names a:hover{background:#f1f6f8}#hub-names b{font-size:11px;color:#7b96a3}.hub-selected{border-bottom:1px solid var(--line);padding:3px 0 17px;margin-bottom:20px}.hub-selected .eyebrow{font-size:10px}.hub-selected h2{font-size:26px;margin:8px 0;display:flex;align-items:center;flex-wrap:wrap;gap:14px}.hub-selected h2 span{font-size:14px;color:#72909b;font-weight:400}.hub-selected p{font-size:12px;color:#8197a3;margin:0}.hub-project-controls{display:grid;grid-template-columns:2fr 1fr;gap:15px}.hub-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.hub-project-card{display:block;background:#fff;border:1px solid #dfe7ec;border-radius:12px;padding:21px;transition:border-color .15s,box-shadow .15s;overflow-wrap:anywhere}.hub-project-card:hover{border-color:#87abb9;box-shadow:0 5px 18px #2d5f7010}.hub-card-meta{font-size:10px;color:#77909e;display:flex;justify-content:space-between;flex-wrap:wrap;gap:5px}.hub-card-meta span{background:#edf4f3;padding:1px 5px;border-radius:3px;color:#5b8275}.hub-project-card h3{font-size:16px;line-height:1.75;margin:12px 0 7px;word-break:keep-all}.hub-project-card>small{font-size:10px;color:#8ca0aa}.hub-raw{background:#f7f9fb;border-radius:7px;padding:12px;margin-top:16px;font-size:12px}.hub-raw>span{display:block;font-size:10px;color:#879ba6;margin:5px 0}.hub-raw p{margin:4px 0;line-height:1.8}.hub-raw small{font-size:10px;display:block;line-height:1.8}.hub-raw b{font-size:10px;font-weight:400;color:#668998}.hub-card-footer{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:16px;font-size:10px;color:#80939f}.hub-card-footer strong{font-size:12px;color:#487d90;white-space:nowrap}
@media(max-width:1200px){.hub-card-grid{grid-template-columns:1fr}.hub-layout{grid-template-columns:180px minmax(0,1fr);gap:18px}}
@media(max-width:680px){.hub-layout{grid-template-columns:1fr}.hub-picker{position:static;max-height:280px}.hub-picker h2{margin-bottom:10px}#hub-names{display:grid;grid-template-columns:1fr 1fr;gap:4px}#hub-names a{font-size:12px;padding:8px}.hub-project-card{padding:18px}.hub-project-controls{grid-template-columns:1.6fr 1fr;gap:10px}.hub-selected h2{font-size:23px}.connection-chips{gap:6px}.connection-chips a{font-size:11px}}
''')
(root/'hub-data-checks.json').write_text(json.dumps({'projectCount':len(cat['projects']),'ministryLabels':len(set(r['label'] for r in rows)),'ministryRecordLinks':len(rows),'allLabelsInOriginalText':True,'uniqueProjectLabelOrigin':True},ensure_ascii=False,indent=2),encoding='utf8')
print('Ministry labels:',len(set(r['label'] for r in rows)),'source links:',len(rows))

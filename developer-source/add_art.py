from pathlib import Path
import re
root=Path(__file__).parent/'dist'
assets=root/'assets';assets.mkdir(exist_ok=True)
def svg(body,view='0 0 720 440'):
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" fill="none"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="#edf4f3"/><stop offset="1" stop-color="#edf0fb"/></linearGradient><linearGradient id="land" x2="0" y2="1"><stop stop-color="#a8c9bb"/><stop offset="1" stop-color="#dce9df"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="180%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#395774" flood-opacity=".09"/></filter></defs>{body}</svg>'
def building(x,y,w,h,c='#b1c7d6'):
 out=f'<path d="M{x} {y}v{-h}l{w} -12 20 12v{h}l-20 12z" fill="{c}"/><path d="M{x+w} {y+12}v{-h}l20 -12v{h}z" fill="#819eaf" opacity=".45"/><path d="M{x} {y-h}l{w} -12 20 12 -{w} 12z" fill="#f7fafb"/>'
 for dx in range(8,w-3,13):
  for dy in range(14,h-7,19):out+=f'<path d="M{x+dx} {y-h+dy}v7" stroke="#fff" stroke-width="4" opacity=".7"/>'
 return out
def tree(x,y,s=1):
 return f'<g transform="translate({x} {y}) scale({s})"><ellipse cy="5" rx="17" ry="6" fill="#638b78" opacity=".12"/><path d="M0 0v-27" stroke="#698a7b" stroke-width="4"/><path d="M-20 -18 0 -65 20 -18Z" fill="#86ad99"/><path d="M0 -65 20 -18H0Z" fill="#6f9988"/></g>'
def document(x,y,angle=0):
 return f'<g transform="translate({x} {y}) rotate({angle})" filter="url(#shadow)"><rect width="77" height="94" rx="10" fill="white"/><rect x="14" y="16" width="24" height="7" rx="3.5" fill="#90b2ab"/><path d="M14 38h48M14 51h38M14 64h46M14 77h27" stroke="#d5e2e6" stroke-width="4" stroke-linecap="round"/></g>'
hero='<rect x="25" y="25" width="670" height="385" rx="95" fill="url(#sky)"/><circle cx="573" cy="92" r="35" fill="#edddbb"/><path d="M89 243 189 102 277 227 358 135 467 266" fill="#d4e2df"/><path d="m189 102 27 39 -27 -9 -20 10z" fill="#f8faf7"/><path d="M120 278q214-118 482-3l-9 67q-240 90-473-3Z" fill="#a4bdae"/><ellipse cx="360" cy="278" rx="244" ry="74" fill="url(#land)"/><path d="M159 297q112-35 197 7t224-7" stroke="#f9faf6" stroke-width="16"/><path d="M373 217q-71 29-17 87t-16 36" stroke="#f9faf6" stroke-width="13"/>'
hero+=building(244,266,45,94)+building(315,250,40,135,'#b7bfd9')+building(390,271,66,72)+building(463,262,30,49,'#d8cbb3')
hero+=''.join(tree(x,y,s) for x,y,s in [(178,270,.85),(213,298,.65),(520,295,.8),(551,269,.65),(430,323,.6)])
hero+='<path d="M140 159Q340 20 579 177M139 159Q236 339 571 175" stroke="#799ba9" stroke-width="1.8" stroke-dasharray="5 7"/><g fill="#7599a7" stroke="#f8fafb" stroke-width="6"><circle cx="139" cy="159" r="10"/><circle cx="579" cy="177" r="10"/><circle cx="382" cy="91" r="9"/></g>'+document(90,110,-10)+document(549,120,10)
hero+='<g fill="#97b6bc"><path d="M467 76v14m-7-7h14" stroke="#97b6bc" stroke-width="2"/><circle cx="80" cy="267" r="4"/><circle cx="628" cy="259" r="4"/></g>'
(assets/'connected-regions.svg').write_text(svg(hero),encoding='utf8')
for i,(color,accent) in enumerate([('#deebe4','#88ae9c'),('#e5e6f1','#a5a6c8'),('#deebf0','#86aabf'),('#e9e8de','#b2ad88'),('#e3eada','#97ac84'),('#dcedea','#7faaa0'),('#e2e8f1','#94a8c7')]):
 body=f'<rect width="360" height="130" rx="18" fill="{color}"/><circle cx="285" cy="34" r="17" fill="#f5e9c9"/><path d="M0 97 70 23 130 92 192 39 270 103 360 77v53H0Z" fill="{accent}" opacity=".24"/><path d="M0 115q95-57 180-14t180-2v31H0Z" fill="{accent}" opacity=".28"/>'
 body+=building(130,105,28,47,accent)+building(174,99,23,64,accent)+tree(79,109,.65)+tree(252,116,.53)
 body+='<path d="M31 86q156-88 298-20" stroke="white" stroke-width="2" stroke-dasharray="4 6"/><g fill="white"><circle cx="32" cy="86" r="4"/><circle cx="221" cy="47" r="4"/><circle cx="329" cy="66" r="4"/></g>'
 (assets/f'region-{i}.svg').write_text(svg(body,'0 0 360 130'),encoding='utf8')
body='<ellipse cx="170" cy="163" rx="135" ry="21" fill="#e5edf0"/>'+document(70,40,-12)+document(129,20,7)+'<circle cx="228" cy="108" r="38" fill="#edf5f3" stroke="#84aaa4" stroke-width="7"/><path d="m256 137 27 28" stroke="#557b80" stroke-width="12" stroke-linecap="round"/><path d="M212 105h31m-31 13h19" stroke="#9ebcb6" stroke-width="4" stroke-linecap="round"/><circle cx="264" cy="43" r="7" fill="#ddc79f"/>'
(assets/'evidence-library.svg').write_text(svg(body,'0 0 340 200'),encoding='utf8')
body='<ellipse cx="170" cy="105" rx="130" ry="85" fill="url(#sky)"/>'
for x,y,r,c in [(57,75,16,'#91b2a6'),(105,37,12,'#b6a6cb'),(244,46,19,'#b7cbe2'),(280,124,13,'#d7c49e'),(222,166,17,'#91b2a6'),(86,157,13,'#a6b8d3')]:
 body+=f'<path d="M170 104 {x} {y}" stroke="#b3c6cf" stroke-width="2"/><circle cx="{x}" cy="{y}" r="{r+6}" fill="white"/><circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
body+='<circle cx="170" cy="104" r="35" fill="#547d88" filter="url(#shadow)"/><path d="M156 98h28m-28 12h20" stroke="#f7fafb" stroke-width="4" stroke-linecap="round"/>'
(assets/'evidence-network.svg').write_text(svg(body,'0 0 340 200'),encoding='utf8')
p=root/'app.js';s=p.read_text(encoding='utf8')
s=re.sub(r'<svg class="hero-art".*?</svg>', '<figure class="atlas-hero-figure"><img src="assets/connected-regions.svg" alt="지역의 도시와 자연, 문서 근거가 연결되는 개념 일러스트"><figcaption>지역과 사업, 그리고 연결된 근거</figcaption></figure>',s,count=1)
s=s.replace('<h3>${E(r.region)}<span class="arrow">','<img class="region-art" src="assets/region-${D.regions.indexOf(r)}.svg" alt="" loading="lazy"><h3>${E(r.region)}<span class="arrow">')
s=s.replace('<div class="project-head"><a', '<div class="project-visual-strip"><img src="assets/region-${D.regions.findIndex(r=>r.region===p.region)}.svg" alt=""><span>REGIONAL PROJECT · EVIDENCE RECORD</span><small>개념 일러스트</small></div><div class="project-head"><a')
s=s.replace('<div class="page-heading"><div class="eyebrow">','<div class="page-heading illustrated-heading"><img class="section-art" src="assets/${t===\'지식그래프\'?\'evidence-network\':\'evidence-library\'}.svg" alt=""><div class="eyebrow">')
p.write_text(s,encoding='utf8')
with (root/'style.css').open('a',encoding='utf8') as f:f.write('''
/* Decorative vector artwork; no project facts encoded. */
.atlas-hero-figure{margin:0;min-width:0}.atlas-hero-figure img{display:block;width:100%;filter:drop-shadow(0 15px 20px #375e7010)}.atlas-hero-figure figcaption{text-align:center;font-size:10px;color:#8b9eaa;letter-spacing:1px;margin-top:-8px}.region-card{overflow:hidden;padding-top:0}.region-art{display:block;width:calc(100% + 42px);max-width:none;margin:0 -21px 18px;height:98px;object-fit:cover}.region-card:hover .region-art{filter:saturate(1.12)}.illustrated-heading{position:relative;padding-right:190px;min-height:135px}.section-art{position:absolute;right:0;top:-15px;width:185px;height:130px;object-fit:contain}.project-visual-strip{height:110px;border-radius:14px;overflow:hidden;background:linear-gradient(110deg,#e8eff2,#f2f5f8);position:relative;margin-bottom:25px;display:flex;align-items:center;padding:30px}.project-visual-strip>img{position:absolute;right:0;top:0;width:340px;height:110px;object-fit:cover;mask-image:linear-gradient(to right,transparent,#000 25%)}.project-visual-strip>span{position:relative;max-width:55%;font-size:10px;letter-spacing:2px;color:#698794}.project-visual-strip>small{position:absolute;right:12px;bottom:5px;font-size:9px;color:#647d87;background:#ffffffa8;border-radius:3px;padding:0 4px}
@media(max-width:900px){.hero{grid-template-columns:minmax(0,1fr) 240px}.atlas-hero-figure figcaption{font-size:9px}.hero h1{font-size:32px}}
@media(max-width:680px){.hero{grid-template-columns:1fr}.atlas-hero-figure{max-width:340px;margin:0 auto 12px}.hero .actions{margin-bottom:0}.illustrated-heading{padding-right:95px;min-height:130px}.section-art{width:100px;height:90px;top:-5px;right:-8px}.region-art{height:75px;width:calc(100% + 34px);margin:0 -17px 14px}.region-card{padding-top:0}.project-visual-strip{height:85px;padding:18px}.project-visual-strip>img{width:230px;height:85px}.project-visual-strip>span{font-size:8px;max-width:40%;line-height:1.8}.hero h1{font-size:31px}}
''')
print('Added 10 SVG illustrations; integrated overview, regions, project detail, and section headers.')

const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>v==null?'미기재':v.toLocaleString('ko-KR',{maximumFractionDigits:3});
const pc=(n,d)=>d?(100*n/d).toFixed(1)+'%':'—';
const eco=['R&D','규제완화(제도)','재정·세제 지원','인프라 조성','인재양성','금융지원','유형 미확인'];
const life=['교통','주거','의료','교육','돌봄','문화','기타'];
const box=(title,body)=>'<section class="card"><h2>'+E(title)+'</h2>'+body+'</section>';
const note=t=>'<p class="budget-note">'+E(t)+'</p>';
function table(h,rows){return '<table class="tables"><thead><tr>'+h.map(x=>'<th>'+E(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((x,i)=>'<td data-label="'+E(h[i])+'">'+E(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';}
function bars(title,rows,unit,color=''){
 const max=Math.max(1,...rows.map(x=>x[1]??0));
 return '<div class="plot '+color+'"><h3>'+E(title)+'</h3>'+rows.map(([name,n,keys,mode])=>'<div class="barrow"><span>'+E(name)+'</span><div class="track"><i style="width:'+((n??0)*100/max)+'%"></i></div><b>'+(keys?pick(num(n)+(n==null?'':unit),title+' · '+name,keys,mode):num(n)+(n==null?'':unit))+'</b></div>').join('')+'</div>';
}
function pair(groups){
 const rows=Object.entries(groups);
 return '<div class="plots">'+bars('총사업비 · 철도 제외',rows.map(([k,v])=>[k,v.wholeEx[0],v.keys.filter(id=>!catalog.get(id).rail&&catalog.get(id).whole>0),'whole']),'억원')+bars('국비 요구액 · 철도 제외',rows.map(([k,v])=>[k,v.nationalEx[0],v.keys.filter(id=>!catalog.get(id).rail&&catalog.get(id).national>0),'national']),'억원','gold')+'</div>';
}
let catalog=new Map(),selections=[];
function pick(value,label,keys,mode='count'){
 if(!Array.isArray(keys))return E(value);
 const id=selections.push({label,keys,mode})-1;
 return '<button class="pick" data-pick="'+id+'" type="button">'+E(value)+'</button>';
}
function measure(v,k,exclude,label){
 const metric=exclude?k+'Ex':k;
 return pick(num(v[metric][0]),label,v.keys.filter(id=>{const p=catalog.get(id);return p?.[k]>0&&(!exclude||!p.rail);}),k);
}
function indexedTable(headers,rows){
 return '<table class="tables"><thead><tr>'+headers.map(h=>'<th>'+E(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((cell,i)=>'<td data-label="'+E(headers[i])+'">'+cell+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
}
function totals(g){
 const headers=['범위','전략사업','실천과제','총사업비 제외 / 포함','국비 제외 / 포함','금액 미집계 제외 / 포함 (총사업비 · 국비)'];
 return indexedTable(headers,Object.entries(g).map(([k,v])=>[E(k),pick(v.s,k+' · 상위 전략사업',v.keys.filter(id=>catalog.get(id)?.strategy),'strategy'),pick(v.n,k+' · 실천과제',v.keys),...['whole','national'].map(field=>[true,false].map(ex=>measure(v,field,ex,k+' · '+(field==='whole'?'총사업비':'기간 국비')+' · 철도 '+(ex?'제외':'포함'))).join(' / ')),['whole','national'].map(field=>[true,false].map(ex=>pick(v[ex?field+'Ex':field][1],k+' · 금액 미집계',v.keys.filter(id=>{const p=catalog.get(id);return !(p[field]>0)&&(!ex||!p.rail);}))).join(' / ')).join(' · ')]));
}
function displaySelection(dialog,selection){
 const records=selection.keys.map(k=>catalog.get(k)).filter(Boolean);
 const monetary=['whole','national'].includes(selection.mode);
 if(monetary)records.sort((a,b)=>b[selection.mode]-a[selection.mode]);
 const link=p=>'<button class="pick" type="button" data-card="'+E(p.key)+'">'+E(p.title)+'</button>';
 function list(){
  const subtitle=monetary?' · 합계 '+num(Math.round(records.reduce((s,p)=>s+p[selection.mode],0)*1000)/1000)+'억원':'';
  dialog.innerHTML='<button data-close>닫기</button><h2>'+E(selection.label)+'</h2><p>실천과제 '+records.length+'건'+subtitle+'</p>';
  if(selection.mode==='strategy'){
   const by=new Map();for(const p of records){if(!by.has(p.strategy))by.set(p.strategy,[]);by.get(p.strategy).push(p);}
   dialog.innerHTML+=[...by].map(([name,ps])=>'<h3>'+E(name)+'</h3><ul>'+ps.map(p=>'<li>'+link(p)+'</li>').join('')+'</ul>').join('');
  }else dialog.innerHTML+=indexedTable(['사업명','권역','원문 기재기관','총사업비','기간 국비'],records.map(p=>[link(p),E(p.region),E(p.agency.join(' · ')),num(p.whole),num(p.national)]));
  dialog.scrollTop=0;
 }
 list();dialog.onclick=event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close')){dialog.close();return;}
  if(b.hasAttribute('data-back')){list();return;}
  const p=catalog.get(b.dataset.card);if(!p)return;
  dialog.innerHTML='<button data-close>닫기</button> <button data-back>← 사업 목록</button><h2>'+E(p.title)+'</h2><p>'+E(p.about||'사업 내용 미기재')+'</p>'+table(['항목','위원용 요약'],[['권역·분야',p.region+' · '+p.category],['상위 전략사업',p.strategy||'미확인'],['원문 기재기관',p.agency.join(' · ')],['시행 주체',p.host||'미확인'],['사업 기간',p.period||'미기재'],['사업 공간',p.area||'위치 미확인'],['총사업비',num(p.whole)+' · '+p.wholeStatus],['기간 국비 요구액',num(p.national)+' · '+p.nationalStatus],['확인된 연도별 투자계획',p.investment||'확인 가능한 연도별 금액 없음'],['철도망',p.rail?'해당':'비해당'],...(p.axis?[['상위 적용 산업',p.sectors.join(' · ')||'미확인'],['지역 고용 상위 업종',p.existing.join(' · ')||'연결 미확인'],['위치가 확인된 시·도 고용 상위 업종',(p.localExisting||[]).join(' · ')||'연결 미확인'],['권역 성장엔진',p.engine==='성장엔진 외'?'연결 미확인':p.engine],['같은 과제 기준 비교',p.axis]]:[])]);dialog.scrollTop=0;
 };
 if(!dialog.open)dialog.showModal();
}
function joint(v){return box('기존 산업과 성장엔진 · 같은 과제 기준',note('해당 권역 경제권 과제를 한 번씩 셉니다. 기존 산업은 2024년 권역 고용 상위 5개 대분류 또는 제조업 상위 5개 세부 업종과 사업 용도가 연결된 경우입니다. 제조업은 세부 업종에서만 연결합니다. 성장엔진은 같은 과제에서 해당 권역 발표 분야와 연결된 경우입니다. 미확인은 비관련 판정이 아닙니다.')+totals(v.joint));}

function agencies(v){
 const rows=Object.entries(v.agencies).sort((a,b)=>(b[1].first.national[0]||0)-(a[1].first.national[0]||0));
 return box('부처·기관별 국비 요구',note('연결 기관 '+rows.filter(([k])=>k!=='미기재').length+'개 · 전략사업 연결 기관 '+rows.filter(([k,a])=>k!=='미기재'&&a.strategies>0).length+'개')+bars('첫 표기 기관 귀속 국비 상위 15',rows.slice(0,15).map(([k,a])=>[k,a.first.national[0],a.first.keys.filter(id=>catalog.get(id).national>0),'national']),'억원')+note('철도 포함. 사업 수는 복수 기관에 각각 연결하고 국비는 첫 표기에 한 번만 귀속합니다.')+note('분야별 기관 표의 숫자를 누르면 해당 목록이 열립니다.') );
}
function status(v){return box('사업 수와 예산',bars('실천과제 수',Object.entries(v.categories).map(([k,a])=>[k,a.n,a.keys]),'건')+pair(v.categories)+totals({전체:v.total,...v.categories})+'<details><summary>전략사업에 연결된 과제 예산</summary>'+totals({전체:v.strategyBudget,...v.categoryStrategy})+note('전략사업 자체 예산 미기재. 소속 과제 부분합이며 전국 예산에 다시 더하지 않습니다.')+'</details>');}
function industry(v){return box('지역의 기존 산업 · 고용 비중',Object.entries(v.jobs).map(([k,sets],i)=>{
 const body='<div class="plots">'+Object.entries(sets).map(([name,rows])=>bars(name+' 상위 5',rows,'%')).join('')+'</div>';
 return i===0?'<h3>'+E(k)+'</h3>'+body:'<details><summary>'+E(k)+'</summary>'+body+'</details>';
}).join('')+'<p>2024년 전국사업체조사 · 각 업종 종사자 ÷ 지역 전체 종사자. <a href="https://kosis.kr/statHtml/statHtml.do?orgId=101&amp;tblId=DT_1K52F01">KOSIS 원표</a></p>');}
function shares(title,g,labels){const total=labels.reduce((n,k)=>n+(g[k]?.n||0),0),budget=labels.reduce((n,k)=>n+(g[k]?.national[0]||0),0);
 return box(title,'<div class="plots">'+bars('과제 비중',labels.map(k=>[k,total?+(100*(g[k]?.n||0)/total).toFixed(1):null,g[k]?.keys||[]]),'%')+bars('국비 부분합 비중',labels.map(k=>[k,g[k]?.national[0]!=null&&budget?+(100*g[k].national[0]/budget).toFixed(1):null,(g[k]?.keys||[]).filter(id=>catalog.get(id).national>0),'national']),'%','gold')+'</div>'+totals(Object.fromEntries(labels.filter(k=>g[k]).map(k=>[k,g[k]])))+note('건수 비중은 표시 범위의 실천과제 기준이며 국비 비중은 금액을 집계할 수 있는 과제 기준입니다.'));}
function strategyPlot(groups){
 const entries=Object.entries(groups),n=entries.reduce((s,[,v])=>s+v.s,0),b=entries.reduce((s,[,v])=>s+(v.national[0]||0),0);
 return box('전략사업별 비중','<div class="plots">'+bars('전략사업 수 비중',entries.map(([k,v])=>[k,n?+(100*v.s/n).toFixed(1):null,v.keys,'strategy']),'%')+bars('연결 과제 국비 비중',entries.map(([k,v])=>[k,b&&v.national[0]!=null?+(100*v.national[0]/b).toFixed(1):null,v.keys.filter(id=>catalog.get(id).national>0),'national']),'%','gold')+'</div>'+note('상위 제목별 소속 과제에서 가장 많은 유형을 사용합니다. 최다 유형이 둘 이상이면 동률입니다.'));
}
function skills(v){
 return box('산업인력·산학협력 지원 · 분야별 비교',totals(v.skills)+note('원래의 경제권·생활권·행재정 편성을 유지한 채 같은 문구 규칙으로 다시 찾았습니다. 산학협력, 산업인력 양성, 기업 수요 교육, 계약학과, 재직자 훈련 등이 사업명이나 요약에 명시된 과제입니다. 분야 간 비교용으로 전체 사업에 다시 더하지 않습니다.'));
}
function railMap(data,region){
 const regions=region?[region]:Object.keys(data).filter(r=>r!=='전국');
 const cities=new Map();
 for(const r of regions)for(const [name,v] of Object.entries(data[r].railPlaces)){
  const key=name+'|'+v.point.join(',');
  if(!cities.has(key))cities.set(key,{name,point:v.point,keys:new Set()});
  v.keys.forEach(k=>cities.get(key).keys.add(k));
 }
 const base=document.querySelector('#region-map')?.innerHTML||'';
 const schematic=[];
 for(const r of regions)for(const key of data[r].railOnly.keys){
  const title=catalog.get(key).title;
  const points=Object.entries(data[r].railPlaces).filter(([name,v])=>v.keys.includes(key)&&title.includes(name)).sort(([a],[b])=>title.indexOf(a)-title.indexOf(b));
  if(points.length<2||!/[~∼]/.test(title))continue;
  const coords=points.map(([,v])=>[(v.point[0]-124.5)*75,(39-v.point[1])*100].join(',')).join(' ');
  const idx=selections.push({label:title,keys:[key],mode:'count'})-1;
  schematic.push('<polyline role="button" tabindex="0" class="rail-line rail-dot" data-pick="'+idx+'" points="'+coords+'"><title>'+E(title)+' · 사업명 연결 개념선</title></polyline>');
 }
 const dots=[...cities.values()].map(({name,point,keys})=>{
  const index=selections.push({label:name+' 관련 철도망',keys:[...keys],mode:'count'})-1;
  const x=(point[0]-124.5)*75,y=(39-point[1])*100;
  return '<g class="rail-dot" role="button" tabindex="0" data-pick="'+index+'" aria-label="'+E(name)+' 철도망 '+keys.size+'건"><title>'+E(name)+' · '+keys.size+'건</title><circle cx="'+x+'" cy="'+y+'" r="5"/><circle class="hit" cx="'+x+'" cy="'+y+'" r="10"/></g>';
 }).join('');
 const missing=regions.flatMap(r=>data[r].railUnlocated);
 const all=regions.flatMap(r=>data[r].railOnly.keys);
 const amount=regions.flatMap(r=>data[r].railOnly.keys.filter(k=>catalog.get(k).national>0));
 const details=regions.map(r=>'<a class="tag" href="#rail/'+encodeURIComponent(r)+'">'+E(r)+' '+data[r].railOnly.n+'건</a>').join(' ');
 return box((region?region+' ':'전국 ')+'철도망 사업 위치','<div class="atlas"><div class="rail-map mapbox">'+base.replaceAll('#regions/','#rail/').replace('</svg>',schematic.join('')+dots+'</svg>')+'</div><div><p>'+details+'</p>'+note('점은 사업명·공간 범위에서 확인한 시·군의 대표 위치입니다. 점선은 사업명에 ~로 구간이 적힌 지명 사이의 개념선입니다. 역 위치나 실제 선형이 아닙니다. 같은 과제가 여러 지점에 보일 수 있습니다.')+'<p>'+pick(all.length+'건 · 전체 목록','철도망 전체',all)+' / '+pick(missing.length+'건 · 시군 미표시','시군 좌표 미연결',missing)+'</p><p>'+pick(num(amount.reduce((n,k)=>n+catalog.get(k).national,0))+'억원 · 기간 국비', '철도망 기간 국비',amount,'national')+'</p><details><summary>지도 지점 목록</summary>'+[...cities.values()].map(v=>pick(v.name+' '+v.keys.size+'건',v.name+' 철도망',[...v.keys])).join(' · ')+'</details><small>대표 위치: 통계청 2013 시·군 및 시·도 경계 중심. <a href="https://github.com/southkorea/southkorea-maps">경계 자료</a></small></div></div>');
}

function regionalRails(data,regions){
 const records=regions.map(k=>[k,data[k].railOnly,data[k].tram]);
 const headers=['권역','철도망 과제','그중 트램','철도망 총사업비','철도망 기간 국비','국비 미집계'];
 const rows=records.map(([k,rail,tram])=>{
  const values=[pick(rail.n+'건',k+' 철도망',rail.keys),pick(tram.n+'건',k+' 트램',tram.keys),measure(rail,'whole',false,k+' 철도망 총사업비'),measure(rail,'national',false,k+' 철도망 국비'),pick(rail.national[1]+'건',k+' 철도망 국비 미집계',rail.keys.filter(id=>!(catalog.get(id).national>0)))];
  return '<tr><td data-label="권역"><a href="#rail/'+encodeURIComponent(k)+'">'+E(k)+'</a></td>'+values.map((v,i)=>'<td data-label="'+headers[i+1]+'">'+v+'</td>').join('')+'</tr>';
 });
 return box('7개 권역 철도망 비교',bars('철도망 총사업비 · 억원',records.map(([k,v])=>[k,v.n?v.whole[0]:0,v.keys.filter(id=>catalog.get(id).whole>0),'whole']),'억원')+'<table class="tables"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>'+note('권역명을 누르면 생활권 예산의 철도 포함·제외 차이를 볼 수 있습니다. 트램은 철도망 건수에 이미 포함돼 있습니다. 기간 국비 미기재는 0원이 아닙니다.'));
}
function railSection(v){
 const l=v.categories['생활권'],r=v.railOnly,t=v.tram;
 return box('생활권 철도망 별도 집계',totals({'대중교통 성격 전체(트램 포함)':v.living['교통']||t,'철도 제외 대중교통':v.livingEx['교통']||{...t,keys:[],s:0,n:0}})+ '<div class="plots">'+bars('생활권 총사업비',[['철도 제외',l.wholeEx[0],l.keys.filter(id=>catalog.get(id).whole>0&&!catalog.get(id).rail),'whole'],['철도 포함',l.whole[0],l.keys.filter(id=>catalog.get(id).whole>0),'whole'],['철도망만',r.whole[0],r.keys.filter(id=>catalog.get(id).whole>0),'whole']],'억원')+bars('생활권 국비 요구액',[['철도 제외',l.nationalEx[0],l.keys.filter(id=>catalog.get(id).national>0&&!catalog.get(id).rail),'national'],['철도 포함',l.national[0],l.keys.filter(id=>catalog.get(id).national>0),'national'],['철도망만',r.national[0],r.keys.filter(id=>catalog.get(id).national>0),'national']],'억원','gold')+'</div>'+note('철도망 '+r.n+'건 · 이 중 트램 '+t.n+'건. 철도 제외 합계에서 트램도 제외합니다. 트램은 대중교통과 철도망 양쪽 성격을 표시하되 전체 과제에서는 한 번만 셉니다.')+totals({'생활권 전체':l,'철도망':r,'트램(철도망에 포함)':t}));
}
const policySource='<a href="https://www.motir.go.kr/kor/article/ATCL3f49a5a8c/172132/view">8월 26일 정부 발표 자료</a>';
function cross(v){
 const rows=Object.entries(v.cross);
 return box('성장엔진별 지원 패키지',indexedTable(['성장엔진',...eco,'합계'],rows.map(([k,a])=>{const ids=v.engines[k].keys;return [E(k),...eco.map(t=>pick(a[t]||0,k+' · '+t,ids.filter(id=>v.economy[t]?.keys.includes(id)))),pick(ids.length,k,ids)];}))+note('실천과제 수 · 주 유형 1개 기준. 성장엔진 외는 현재 문구로 연결을 확인하지 못한 과제입니다.'));
}
function locations(v){
 return box('사업 공간 범위와 기간 국비',bars('원문 위치 표기별 실천과제',Object.entries(v.space).map(([k,a])=>[k,a.n,a.keys]),'건')+totals(v.space)+(v.cityScope?'<details><summary>도시·군별 사업 수와 금액</summary>'+totals(v.cityScope)+note('복수 도시 사업의 전체 금액을 각 도시에서 참조합니다. 도시별 금액은 합산하지 않습니다.')+'</details>':''));
}
function jobCross(v){
 return box('고용 상위 업종과 경제권 사업',Object.entries(v.jobLinks).map(([k,rows],i)=>{
 const body=indexedTable(['업종 구분','업종','지역 고용 비중','연결 과제','국비(억원)','금액 제외'],rows.map(([type,name,share,metric,n,covered,keys])=>[E(type),E(name),share+'%',covered?pick(n,k+' · '+name,keys):'비교 범위 밖',covered&&n?pick(num(metric[0]),k+' · '+name+' 국비',keys.filter(id=>catalog.get(id).national>0),'national'):'—',covered?pick(metric[1],name+' 국비 미집계',keys.filter(id=>!(catalog.get(id).national>0))):'—']));
 return i?'<details><summary>'+E(k)+'</summary>'+body+'</details>':body;
 }).join('')+note('2024년 고용 통계와 24개 비교 업종의 문구 연결 기준. 대분류는 비교 가능한 하위 업종의 과제를 한 번씩 집계합니다. 시·도는 공간 범위에서 해당 지역을 식별한 과제만 포함합니다. 0건은 이 기준으로 연결한 과제가 없다는 뜻입니다.'));
}
function deptBreakdown(v){
 return box('분야별 소관기관과 예산 구분',Object.entries(v.deptSplit).map(([cat,records])=>'<details><summary>'+E(cat)+' · 기관별 열기</summary>'+indexedTable(['기재기관','연결 전략사업','연결 과제','귀속 국비','예산 / 비예산 / 구분 미확인 국비'],Object.entries(records).sort((a,b)=>(b[1][2][0]||0)-(a[1][2][0]||0)).map(([name,[st,n,m,t]])=>{
 const linked=(cat==='전체'?v.total:v.categories[cat]).keys.filter(id=>catalog.get(id).agency.includes(name));const lead=linked.filter(id=>catalog.get(id).agency[0]===name&&catalog.get(id).national>0);
 return [E(name),pick(st,cat+' · '+name,linked.filter(id=>catalog.get(id).strategy),'strategy'),pick(n,cat+' · '+name,linked),pick(num(m[0]),name+' 귀속 국비',lead,'national'),Object.entries(t).map(([k,a])=>pick(num(a),name+' · '+k,lead.filter(id=>catalog.get(id).budget===k),'national')).join(' / ')];
 }))+'</details>').join('')+note('단위 억원 · 철도 포함. 과제는 복수 기관마다 연결하되 국비는 첫 표기 기관에 한 번 귀속합니다.'));
}
function highlights(v){
 const cat=Object.entries(v.categories).sort((a,b)=>b[1].n-a[1].n)[0];
 const dept=Object.entries(v.agencies).filter(([k])=>k!=='미기재').sort((a,b)=>(b[1].first.national[0]||0)-(a[1].first.national[0]||0))[0];
 const econ=v.categories['경제권'].n,matched=econ-(v.engines['성장엔진 외']?.n||0);
 return box('수치로 보는 현황',note(cat[0]+' 과제가 '+cat[1].n+'건으로 전체의 '+pc(cat[1].n,v.total.n)+'입니다. 경제권 '+econ+'건 중 '+matched+'건('+pc(matched,econ)+')에서 권역 성장엔진 연결 문구가 확인됩니다.')+note(dept[0]+'의 첫 표기 귀속 국비는 '+num(dept[1].first.national[0])+'억원으로 이 범위의 국비 부분합 '+num(v.total.national[0])+'억원 중 '+pc(dept[1].first.national[0],v.total.national[0])+'입니다.')+note('총사업비 집계 제외: 보류 '+v.budgetBasis.whole.held+'건, 0 표기 '+v.budgetBasis.whole.zero+'건. 국비 집계 제외: 보류 '+v.budgetBasis.national.held+'건, 0 표기 '+v.budgetBasis.national.zero+'건.'));
}
export function start(data,config){
 const main=document.querySelector('#main'),regions=config.regions;
 if(!regions.every(r=>data[r]?.railPlaces&&data[r]?.skills&&data[r]?.jobLinks&&data[r]?.deptSplit&&data[r]?.space&&data[r]?.cross)){
  throw Error('집계자료 갱신이 필요합니다. 관리자가 새 ② 분석 결과 파일을 다시 등록한 뒤 새로고침해 주세요.');
 }
 catalog=new Map(regions.flatMap(r=>(data[r].cards||[]).map(p=>[p.key,p])));
 if(catalog.size!==data['전국'].total.n)throw Error('새 ② 위원용 자료를 등록해 주세요.');
 const dialog=document.createElement('dialog');dialog.className='summary-dialog';dialog.setAttribute('aria-label','위원용 사업 열람');document.body.append(dialog);main.onclick=event=>{const b=event.target.closest('[data-pick]');if(b)displaySelection(dialog,selections[Number(b.dataset.pick)]);};
 function render(){
  selections=[];
  const [path='overview',raw]=location.hash.slice(1).split('/'),r=regions.find(k=>encodeURIComponent(k)===raw||k===raw)||regions[0],v=data[r],all=data['전국'];
  const links=name=>'<nav class="regiontabs">'+regions.map(k=>'<a class="'+(k===r?'current':'')+'" href="#'+name+'/'+encodeURIComponent(k)+'">'+E(k)+'</a>').join('')+'</nav>';
  const reg=Object.fromEntries(regions.map(k=>[k,data[k].total]));let title,body;
  const engines=()=>box(r+' 성장엔진',config.engines[r].map(E).join(' · '));
  if(path==='rail'){title=r+' 철도망';body=links(path)+railMap(data,r)+railSection(v)+regionalRails(data,regions);}
  else if(path==='regions'){title='권역별 현황';body=links(path)+engines()+status(v)+industry(v)+joint(v)+jobCross(v)+locations(v)+skills(v)+railMap(data,r)+railSection(v)+agencies(v)+deptBreakdown(v)+highlights(v);}
  else if(path==='economy'){title='분석지표 1 · 성장엔진';body=links(path)+engines()+status(v)+agencies(v)+deptBreakdown(v)+shares('경제권 지원 성격',v.economy,eco)+strategyPlot(v.ecoStrategies)+cross(v)+box('성장엔진 연결 과제',bars('실천과제',Object.entries(v.engines).map(([k,a])=>[k,a.n,a.keys]),'건')+totals(v.engines))+industry(v)+joint(v)+jobCross(v)+skills(v)+highlights(v)+box('상위 적용 산업',bars('복수 분야 중복 가능',Object.entries(v.applications).sort((a,b)=>b[1].n-a[1].n).map(([k,a])=>[k,a.n,a.keys]),'건'));}
  else if(path==='living'){title='분석지표 2 · 정주여건';body=links(path)+shares('정주여건 유형 · 철도 제외',v.livingEx,life)+strategyPlot(v.lifeStrategies)+railMap(data,r)+railSection(v)+skills(v)+regionalRails(data,regions)+box('정주여건 분포',note('철도 제외 생활권 '+(v.categories['생활권'].n-v.railOnly.n)+'건 가운데 대중교통은 '+(v.livingEx['교통']?.n||0)+'건입니다. 과제가 없는 유형: '+(life.slice(0,6).filter(k=>!v.livingEx[k]?.n).join(' · ')||'없음')+'.')+policySource)+box('7개 권역 비교 · 철도 제외',indexedTable(['권역',...life],regions.map(k=>[E(k),...life.map(t=>pick(data[k].livingEx[t]?.n||0,k+' · '+t,data[k].livingEx[t]?.keys||[]))])));}
  else if(path==='search'){title='사업 검색';body=box('사업 목록과 요약','<p>사업명·권역·부처·적용 산업으로 사업을 찾습니다.</p><label>검색어 <input id="query" placeholder="예: 중부권 교통"></label><div id="matches"></div>');}
  else if(path==='method'){title='집계 기준';body=box('단위 및 자료 범위',note('전략사업은 상위 제목 고유값, 실천과제는 과제 수입니다. 금액은 억원, 국비는 2027~2032년 요구액입니다. 0 표기·보류는 부분합에서 제외합니다.')+totals(all.budgetTypes));}
  else{
   title='권역별 발전계획 분석 결과';
   const template=document.querySelector('#region-map');
   const map=template?template.innerHTML:'';
   body=box('전국 성장엔진 지도','<div class="atlas"><div class="mapbox">'+map+'</div><div>'+regions.map(k=>'<a class="maplabel" href="#regions/'+encodeURIComponent(k)+'"><strong>'+E(k)+'</strong><span>'+config.engines[k].map(E).join(' · ')+'</span></a>').join('')+'</div></div>'+note('지도에서 권역을 누르면 해당 권역 현황으로 이동합니다. 전국 공통 성장엔진: AI. 대도시·거점도시: 확정 목록 입력 후 표기.')+policySource)+status(all)+joint(all)+box('7개 권역 비교',bars('전략사업 수',Object.entries(reg).map(([k,a])=>[k,a.s,a.keys.filter(id=>catalog.get(id).strategy),'strategy']),'건')+pair(reg)+totals(reg))+box('지역 기존 산업 · 권역별 고용 1위',bars('지역 전체 종사자 대비 비중',regions.map(k=>{const a=data[k].jobs[k]['전체 산업'][0];return [k+' · '+a[0],a[1]];}),'%'))+railMap(data,null)+regionalRails(data,regions)+railSection(all)+skills(all)+agencies(all)+deptBreakdown(all)+locations(all)+highlights(all)+box('전국 현황 요지',note('경제권 '+all.categories['경제권'].n+'건, 생활권 '+all.categories['생활권'].n+'건, 행재정 '+all.categories['행재정'].n+'건입니다. 생활권 국비 요구액은 철도 제외 '+num(all.categories['생활권'].nationalEx[0])+'억원, 포함 '+num(all.categories['생활권'].national[0])+'억원입니다.'));
  }
  main.innerHTML='<h1>'+E(title)+'</h1>'+body;
  if(path==='search'){
   const input=document.querySelector('#query'),out=document.querySelector('#matches');
   const show=()=>{const words=input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);const keys=[...catalog.values()].filter(p=>words.every(w=>[p.title,p.region,p.category,...p.agency,...p.sectors,p.engine].join(' ').toLowerCase().includes(w))).map(p=>p.key);out.innerHTML=words.length?pick(keys.length+'건 · 사업 목록 보기','검색 결과',keys):note('검색어를 입력하세요.');};input.oninput=show;show();
  }
  const map=main.querySelector('#region-map')||main.querySelector('.mapbox:not(.rail-map) svg');
  if(map){
   for(const link of map.querySelectorAll('a')){
    const name=decodeURIComponent(link.getAttribute('href').split('/').pop());
    const label=[...main.querySelectorAll('.maplabel')].find(a=>decodeURIComponent(a.hash.split('/').pop())===name);
    if(!label)continue;
    link.setAttribute('aria-label',name+' · '+config.engines[name].join(' · '));
    const mark=on=>{label.classList.toggle('highlight',on);link.classList.toggle('highlight',on);};
    for(const el of [label,link])for(const [event,on] of [['mouseenter',true],['mouseleave',false],['focus',true],['blur',false]])el.addEventListener(event,()=>mark(on));
   }
   for(const c of config.cities||[]){
    const lon=c.longitude??c.lon,lat=c.latitude??c.lat;
    if(!Number.isFinite(lon)||!Number.isFinite(lat))continue;
    const x=(lon-124.5)*75,y=(39-lat)*100;
    map.insertAdjacentHTML('beforeend','<circle cx="'+x+'" cy="'+y+'" r="3" fill="#16283e"/><text x="'+(x+4)+'" y="'+y+'">'+E(c.name||c.city)+' · '+E(c.type)+'</text>');
   }
  }
  main.querySelectorAll('.rail-dot').forEach(el=>el.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();displaySelection(dialog,selections[Number(el.dataset.pick)]);}});
  window.scrollTo(0,0);
 }
 window.addEventListener('hashchange',render);render();
}

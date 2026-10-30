// All summaries use selected unique IDs and literal source ministry labels.
function selectionSummarySheets(projects,records){
 const ps=[...new Map(projects.map(p=>[p.id,p])).values()],labels=new Map(ps.map(p=>[p.id,new Set()]));
 records.forEach(r=>{if(labels.has(r.id)&&r.label)labels.get(r.id).add(r.label)});
 const metrics=[['whole','전체 사업비'],['window','2027~2032년 투자액'],['national','해당 기간 국비 요구액']];
 const headers=['집계 구분','사업 수 (건·중복 포함 시 회)','예산 항목','집계 가능 금액 (억원·부분합)','금액 포함 건수','잠정채택 건수 (금액 포함 중)','보류 건수 (금액 제외)','기타 미확인 건수 (금액 제외)','집계 기준'];
 function rows(name,items,note){return metrics.map(([key,title])=>{let sum=0,known=0,provisional=0,held=0,unknown=0;for(const p of items){const status=String(p[key+'_status']||'');if(status.includes('보류'))held++;else if(typeof p[key]==='number'&&Number.isFinite(p[key])){known++;sum+=p[key];if(status.includes('잠정'))provisional++}else unknown++}return [name,items.length,title,known?sum:null,known,provisional,held,unknown,note]})}
 const linked=ps.filter(p=>labels.get(p.id).size),unlinked=ps.filter(p=>!labels.get(p.id).size),repeat=linked.flatMap(p=>Array(labels.get(p.id).size).fill(p)),extra=linked.flatMap(p=>Array(labels.get(p.id).size-1).fill(p));
 const make=(name,r)=>({name,headers,widths:[34,24,29,28,19,27,25,30,85],rows:r});
 const overall=make('선택요약',[
  ...rows('선택 전체 · 중복 제거',ps,'사업 ID당 1건. 부처 연결이 없는 사업도 포함.'),
  ...rows('부처 연결 있음 · 중복 제거',linked,'원문 부처 표기가 1개 이상 연결된 사업 ID당 1건.'),
  ...rows('부처 연결 없음 · 중복 제거',unlinked,'부처별 합계에 들어가지 않는 선택 사업. 소관부처가 없다는 뜻은 아님.'),
  ...rows('부처별 반복 합계',repeat,'사업별 서로 다른 원문 부처 표기 수만큼 반복. 동일 표기의 요약서·상세서 중복은 제거.'),
  ...rows('추가 반복분',extra,'부처별 반복 합계 − 부처 연결 있음 중복 제거 합계. 실제 중복 재원 또는 추가 예산이 아님.')
 ]);
 const regionNames=[...new Set(ps.map(p=>p.region||'권역 미기재'))].sort((a,b)=>a.localeCompare(b,'ko'));
 const ministryNames=[...new Set([...labels.values()].flatMap(s=>[...s]))].sort((a,b)=>a.localeCompare(b,'ko'));
 return [overall,make('권역별요약',regionNames.flatMap(name=>rows(name,ps.filter(p=>(p.region||'권역 미기재')===name),'권역 내 사업 ID당 1건. 권역 간 합계는 선택 전체 중복 제거 합계와 일치.'))),make('부처별요약',ministryNames.flatMap(name=>rows(name,ps.filter(p=>labels.get(p.id).has(name)),'요약서·상세서 원문 표기 기준. 부처 내 ID 중복 제거, 부처 간 반복 포함. 약칭·정식 명칭 통합 안 함.')))];
}

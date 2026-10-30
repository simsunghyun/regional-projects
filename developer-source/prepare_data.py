import pathlib,json,collections,re,hashlib,shutil
ROOT=pathlib.Path(__file__).resolve().parent;WS=ROOT.parent.parent;D=ROOT/'dist';DATA=D/'data';DATA.mkdir(exist_ok=True);(DATA/'projects').mkdir(exist_ok=True);(D/'downloads').mkdir(exist_ok=True)
a=json.loads((WS/'work/analysis_v06.json').read_text(encoding='utf8'))
def dump(p,v,prefix='',suffix=''):
 p.write_text(prefix+json.dumps(v,ensure_ascii=False,separators=(',',':')).replace('</','<\/')+suffix,encoding='utf8')
def group(key,field):
 d=collections.defaultdict(list)
 for r in a[key]:d[r[field]].append(r)
 return d
C={r['id']:r for r in a['components']};K={r['id']:r for r in a['checks']};EV=group('evidence','id');AN=group('annual','id');PC=group('public_comparisons','id');SL={r['id']:r for r in a['searchlog']};PS={r['source_id']:r for r in a['public_sources']};SIM=collections.defaultdict(list)
for r in a['similar']:
 SIM[r['id_a']].append(r);SIM[r['id_b']].append(r)
catalog=[];nodes=[];edges=[];nodeids=set();publicrefs=collections.defaultdict(list)
def node(nid,label,kind,**kw):
 if nid not in nodeids:nodeids.add(nid);nodes.append({'id':nid,'label':label,'kind':kind,**kw})
def edge(src,tgt,relation,level,**kw):edges.append({'source':src,'target':tgt,'relation':relation,'level':level,**kw})
minpat=r'과학기술정보통신부|과기정통부|과기부|산업통상자원부|산업통상부|산업부|기후에너지환경부|기후부|환경부|국토교통부|국토부|해양수산부|해수부|농림축산식품부|농식품부|중소벤처기업부|중기부|보건복지부|복지부|문화체육관광부|문체부|행정안전부|행안부|교육부|고용노동부|노동부|기획예산처|기획처|재정경제부|재경부|기획재정부|기재부|우주항공청|금융위원회|국무조정실|식품의약품안전처|식약처|산림청|농촌진흥청|국가유산청|질병관리청|성평등가족부|여성가족부|방위사업청|방사청|국방부|법무부|조달청|국가데이터처|지방시대위원회|원자력안전위원회|소방청|새만금개발청'
for i,r in enumerate(a['facts']):
 rid=r['id'];key=f'p{i:04d}';p={k:r[k] for k in ['id','region','category','title','status_raw','rail','screen_group','summary_ministry','detail_ministry','whole','window','national','whole_status','window_status','national_status','period','detail_period','type_raw','detail_type','content_terms','detail_match','public_status','public_ids','summary_source','summary_location','detail_source','detail_location','summary_evidence','detail_content_evidence','ministry_evidence','similar_pair_count','previous_reference_ids']}
 p.update(key=key,terms=r['content_terms'].split(';') if r['content_terms']!='정의어 미검출' else [],search_text=r['summary_body'],ministry_terms=list(dict.fromkeys(re.findall(minpat,r['summary_ministry']))),missing=sum(r[k] is None for k in ['whole','window','national']),source_count=len(EV[rid]),differences=[n for k,n in [('period_comparison','기간'),('ministry_comparison','부처표기'),('total_comparison','총액')] if '상이' in K[rid][k]],summary_body=r['summary_body'])
 catalog.append(p)
 ev=[{k:v for k,v in e.items() if k!='text_path'} for e in EV[rid]]
 sourceids=list(dict.fromkeys([x for x in (r['public_ids']+';'+r['previous_reference_ids']).split(';') if x]))
 packet={'id':rid,'components':C[rid],'checks':K[rid],'evidence':ev,'annual':AN[rid],'public':PC[rid],'sources':[PS[x] for x in sourceids if x in PS],'search':SL[rid],'similar':SIM[rid]}
 dump(DATA/'projects'/f'{key}.js',packet,'window.REGION_PROJECT(',');')
 node(rid,r['title'],'project',region=r['region']);rn='region:'+r['region'];node(rn,r['region'],'region');edge(rid,rn,'요약서 권역 기재','original',source_document=r['summary_source'],location=r['summary_location'])
 for t in p['ministry_terms']:
  nid='ministry:'+t;node(nid,t,'ministry');edge(rid,nid,'요약서 부처 표기','original',source_document=r['summary_source'],location=r['summary_location'],original_value=r['summary_ministry'],limit='실제 소관 확정과 구분')
 for t in p['terms']:
  nid='term:'+t;node(nid,t,'term');edge(rid,nid,'내용 용어 검출','rule',evidence_ids=r['detail_content_evidence'] or r['summary_evidence'],limit='독립 내역사업·실제 수행 여부 미확인')
 for e in ev:node(e['evidence_id'],e['field'],'evidence',project=rid);edge(rid,e['evidence_id'],'원문 항목 기재','original',source_document=e['source'],location=e['location'])
 for pc in PC[rid]:
  sid=pc['source_id']
  if not sid:continue
  nid='public:'+sid;node(nid,PS[sid]['title'],'public');edge(rid,nid,pc['relation'],'public',source_id=sid,identity='미확인');publicrefs[sid].append(rid)
for s in a['similar']:edge(s['id_a'],s['id_b'],'사업내용 문구 대조','rule',cosine=s['cosine'],evidence_a=s['source_a'],evidence_b=s['source_b'],limit='동일사업·중복재원 관계 미확인')
regions=[]
for reg in dict.fromkeys(x['region'] for x in catalog):
 rr=[x for x in catalog if x['region']==reg];s={'region':reg,'count':len(rr)}
 for k in ['whole','window','national']:s[k]=round(sum(x[k] for x in rr if x[k] is not None),6);s[k+'_missing']=sum(x[k] is None for x in rr)
 regions.append(s)
meta={'version':'v0.6','date':a['date'],'projectCount':len(catalog),'regionCount':len(regions),'evidenceCount':len(a['evidence']),'publicSourceCount':len(PS),'previousSources':89,'pairCount':len(a['similar']),'annualRows':len(a['annual']),'publicStatus':a['stats']['public_status'],'graphNodes':len(nodes),'graphEdges':len(edges)}
dump(DATA/'catalog.js',{'meta':meta,'regions':regions,'projects':catalog,'terms':[x['tag'] for x in a['rules']],'rules':a['rules']},'window.REGION_DATA=', ';')
dump(DATA/'sources.js',{'sources':list(PS.values()),'refs':dict(publicrefs)},'window.REGION_SOURCES=', ';')
dump(D/'downloads'/'knowledge-graph.json',{'meta':meta,'nodes':nodes,'edges':edges})
dump(D/'downloads'/'project-catalog.json',{'meta':meta,'projects':catalog})
shutil.copyfile(WS/'outputs/draft_20261030_v06/전체사업_사실근거_전수분석_v0.6.xlsx',D/'downloads'/'analysis-v0.6.xlsx')
assert len(catalog)==1312 and len({p['id'] for p in catalog})==1312
assert all(e['source'] in nodeids and e['target'] in nodeids for e in edges)
assert all(len(EV[p['id']])==p['source_count'] for p in catalog)
dump(ROOT/'data-checks.json',{'meta':meta,'uniqueProjects':'passed','graphEndpoints':'passed','allPackets':len(list((DATA/'projects').glob('*.js'))),'sourceSHA256':hashlib.sha256((WS/'work/analysis_v06.json').read_bytes()).hexdigest()})
print(json.dumps(meta,ensure_ascii=False))

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);for(const f of ['dist/data/catalog.js','dist/data/ministry-index.js','multi-view.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const ps=c.window.REGION_DATA.projects,rs=c.window.MINISTRY_INDEX;
for(const source of ['all','summary','detail']){
 const multi=c.multipleMinistryProjects(ps,rs,source),t=c.multipleMinistryTotals(multi);assert.equal(t.repeated-t.unique,t.extra);assert.equal(new Set(multi.map(x=>x.p.id)).size,multi.length);
 for(const x of multi){assert.equal(x.m,new Set(x.records.map(r=>r.label)).size);assert.ok(x.records.every(r=>r.raw.includes(r.label)));assert.ok(x.m>1)}
 for(const k of ['whole','window','national']){assert.ok(Math.abs(t[k].repeated-t[k].unique-t[k].extra)<.0001);assert.equal(t[k].known+t[k].held+t[k].unknown,t.unique);
 // Reconcile weighted totals against summing each exact-label group independently.
 const labels=[...new Set(multi.flatMap(x=>x.labels))];let repeated=0,count=0;
 for(const label of labels)for(const x of multi.filter(x=>x.labels.includes(label))){count++;if(x.p[k]!=null&&x.p[k+'_status']!=='보류')repeated+=x.p[k]}
 assert.equal(count,t.repeated);assert.ok(Math.abs(repeated-t[k].repeated)<.0001);
 }
 console.log(JSON.stringify({source,projects:t.unique,connections:t.repeated,extra:t.extra,together:multi.filter(x=>x.together).length,acrossOnly:multi.filter(x=>!x.together).length,whole:t.whole}));
}
const demo=[{id:'a',whole:10,whole_status:'원문이관',window:null,window_status:'보류',national:0,national_status:'원문이관'}];
const records=[{id:'a',label:'A',origin:'summary'},{id:'a',label:'A',origin:'detail'},{id:'a',label:'B',origin:'detail'}];
const x=c.multipleMinistryProjects(demo,records);assert.equal(x[0].m,2);const t=c.multipleMinistryTotals(x);assert.equal(t.whole.extra,10);assert.equal(t.window.heldRepeated,2);assert.equal(t.national.known,1);assert.equal(t.national.extra,0);
console.log('PASS: deduplication, source filters, weighted reconciliation, zero and held handling.');

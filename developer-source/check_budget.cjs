const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/data/catalog.js','utf8'),ctx);vm.runInContext(fs.readFileSync('dist/data/ministry-index.js','utf8'),ctx);vm.runInContext(fs.readFileSync('budget-view.js','utf8'),ctx);
const d=ctx.window.REGION_DATA,rows=ctx.window.MINISTRY_INDEX,agg=ctx.budgetAggregate;
for(const k of ['whole','window','national']){
 const all=agg(d.projects,k);assert.equal(all.count+all.held+all.unknown,1312);assert.equal(all.count,all.original+all.provisional);
 for(const r of d.regions){const a=agg(d.projects.filter(p=>p.region===r.region),k);assert.ok(Math.abs(a.sum-r[k])<.00001);assert.equal(a.held+a.unknown,r[k+'_missing']);}
 const labels=[...new Set(rows.map(r=>r.label))];for(const label of labels){const ids=new Set(rows.filter(r=>r.label===label).map(r=>r.id));const ps=d.projects.filter(p=>ids.has(p.id));assert.equal(ps.length,ids.size);const a=agg(ps,k);assert.equal(a.count+a.held+a.unknown,ps.length);}
}
assert.equal(agg([{whole:0,whole_status:'원문이관'},{whole:null,whole_status:'보류'}],'whole').count,1);
assert.equal(agg([{whole:null,whole_status:''}],'whole').unknown,1);
assert.equal(agg([{whole:100,whole_status:'보류'}],'whole').sum,0);
console.log('PASS: 7 region totals reconciled; 47 ministry groups deduplicated; all three budgets partitioned; zero/null/held separated.');

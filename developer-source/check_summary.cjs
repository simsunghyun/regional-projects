const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);for(const f of ['export-summary.js','dist/data/catalog.js','dist/data/ministry-index.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const p=(id,n,status='원문이관')=>({id,region:'가',whole:n,whole_status:status});
const a=p('a',10),b=p('b',0),d=p('d',100,'보류'),u=p('u',null);
const records=[{id:'a',label:'A'},{id:'a',label:'A'},{id:'a',label:'B'},{id:'b',label:'A'},{id:'d',label:'B'}];
const sheets=c.selectionSummarySheets([a,a,b,d,u],records),r=sheets[0].rows;
assert.deepEqual(Array.from(r[0].slice(1,8)),[4,'전체 사업비',10,2,0,1,1]);
assert.equal(r[9][1],4);assert.equal(r[9][3],20);assert.equal(r[12][1],1);assert.equal(r[12][3],10);assert.equal(r[6][1],1);assert.equal(r[6][3],null);
assert.equal(c.selectionSummarySheets([b],[])[0].rows[0][3],0);
assert.equal(c.selectionSummarySheets([],[])[0].rows[0][3],null);
const all=c.window.REGION_DATA.projects,full=c.selectionSummarySheets(all,c.window.MINISTRY_INDEX);
for(let k=0;k<3;k++){
 const total=full[0].rows[k],regions=full[1].rows.filter((_,i)=>i%3===k),ministries=full[2].rows.filter((_,i)=>i%3===k);
 for(const col of [1,3,4,5,6,7]){
  assert.ok(Math.abs(regions.reduce((s,r)=>s+(r[col]||0),0)-(total[col]||0))<1e-6);
  assert.ok(Math.abs(ministries.reduce((s,r)=>s+(r[col]||0),0)-(full[0].rows[9+k][col]||0))<1e-6);
  assert.ok(Math.abs((full[0].rows[3+k][col]||0)+(full[0].rows[6+k][col]||0)-(total[col]||0))<1e-6);
 }
}
console.log(JSON.stringify({passed:true,projects:all.length,regions:full[1].rows.length/3,labels:full[2].rows.length/3,unique:full[0].rows[0],repeated:full[0].rows[9]}));

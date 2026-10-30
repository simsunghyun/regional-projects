const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={document:{addEventListener(){}},window:{}};vm.createContext(c);
for(const f of ['selection-preview.js','export-summary.js','dist/data/catalog.js','dist/data/ministry-index.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const all=c.window.REGION_DATA.projects,records=c.window.MINISTRY_INDEX,selected=all.filter((p,i)=>i%3===0);
for(const [idx,kind] of [[1,'region'],[2,'ministry']]){
 const sheet=c.selectionSummarySheets(selected,records)[idx];
 for(let i=0;i<sheet.rows.length;i+=3){const [name,count]=sheet.rows[i],rows=c.selectedDrilldownProjects(selected,{kind,name},records);assert.equal(rows.length,count);assert.equal(new Set(rows.map(p=>p.id)).size,count);assert.ok(rows.every(p=>selected.includes(p)))}
}
assert.equal(c.selectedDrilldownProjects([],{kind:'ministry',name:'산업부'},records).length,0);
console.log('Selected-only region/ministry membership matches all summary counts; IDs deduplicated.');

from pathlib import Path
root=Path(__file__).parent
for p in [root/'budget-view.js',root/'dist/app.js']:
 s=p.read_text(encoding='utf8').replace("사업 수</option>'+budgetFields.map", "사업 수</option>${budgetFields.map").replace(".join('')+'</select></label><label>정렬", ".join('')}</select></label><label>정렬").replace('tabindex="-1"></section>\';','tabindex="-1"></section>`;')
 p.write_text(s,encoding='utf8')

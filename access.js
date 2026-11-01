import {auth, db, doc, login, signOut, isOwner, isAllowed, onAuthStateChanged, onSnapshot, readBytes, readJSON, errorText} from './firebase-client.js';
const panel = document.querySelector('#access-panel');
let started = false;
function show(title, message, user) {
  document.body.classList.add('access-locked');
  panel.replaceChildren();
  const card = document.createElement('div');card.className = 'access-card';
  const logo = document.createElement('img');logo.src = 'assets/committee-logo.svg';logo.alt = '지방시대위원회';
  const h = document.createElement('h1');h.textContent = title;
  const p = document.createElement('p');p.textContent = message;
  const button = document.createElement('button');button.className = 'primary';button.textContent = user ? '다른 계정으로 로그인' : 'Google 계정으로 로그인';
  button.onclick = async () => {button.disabled = true;try {if(user) await signOut(auth);await login();}catch(e){p.textContent=errorText(e);}finally{button.disabled=false;}};
  card.append(logo,h,p,button);
  if (isOwner(user)) {const a=document.createElement('a');a.href='admin.html';a.textContent='이용자·자료 관리 →';card.append(a);}
  panel.append(card);
}
onAuthStateChanged(auth, async user => {
  if (started) {location.reload();return;}
  if (!user) {show('권역별 사업정보','등록된 Google 계정으로 로그인해 주세요.');return;}
  try {
    if (!await isAllowed(user)) {show('등록되지 않은 계정입니다',user.email+' 계정의 이용 등록을 관리자에게 요청해 주세요.',user);return;}
    show('자료를 불러오고 있습니다','잠시만 기다려 주세요.',user);
    const [catalog,index] = await Promise.all([readJSON('data/catalog.js'),readJSON('data/ministry-index.js')]);
    window.REGION_DATA=catalog;window.MINISTRY_INDEX=index;window.PrivateData={json:readJSON};
    const script=document.createElement('script');script.src='app.js';
    await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('화면을 불러오지 못했습니다. 새로고침해 주세요.'));document.head.append(script);});
    started=true;document.body.classList.remove('access-locked');panel.remove();
    const bar=document.createElement('div');bar.className='account-bar';
    const email=document.createElement('span');email.textContent=user.email;
    const logout=document.createElement('button');logout.textContent='로그아웃';logout.onclick=()=>signOut(auth);
    bar.append(email,logout);
    if(isOwner(user)){const a=document.createElement('a');a.href='admin.html';a.textContent='이용자·자료 관리';bar.append(a);}
    document.querySelector('.topbar-right').replaceChildren(bar);
    if(!isOwner(user)) onSnapshot(doc(db,'allowedUsers',user.email),s=>{if(s.data()?.enabled!==true)signOut(auth);},()=>signOut(auth));
  } catch(e) {show('자료 연결을 확인해 주세요',errorText(e),user);}
});
document.addEventListener('click',async event=>{
  const a=event.target.closest('[data-private-download]');if(!a)return;event.preventDefault();
  if(a.dataset.busy)return;a.dataset.busy='1';a.setAttribute('aria-busy','true');
  try {const path=a.dataset.privateDownload;const bytes=await readBytes(path);const url=URL.createObjectURL(new Blob([bytes]));const link=document.createElement('a');link.href=url;link.download=path.split('/').pop();link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  catch(e){alert(errorText(e));}finally{delete a.dataset.busy;a.removeAttribute('aria-busy');}
});

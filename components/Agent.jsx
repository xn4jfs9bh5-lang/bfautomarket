"use client";
import { useState, useCallback, useRef, useEffect } from "react";

// BF AUTO MARKET V7 — PRODUCTION (API via /api/agent)

const ST={c:0,r:Date.now(),M:30};
function ck(){if(Date.now()-ST.r>3600000){ST.c=0;ST.r=Date.now();}if(ST.c>=ST.M)throw new Error("Limite 30/h");ST.c++;}
async function api(body,ret=2){ck();for(let i=0;i<=ret;i++){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),50000);const r=await fetch("/api/agent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,...body}),signal:c.signal});clearTimeout(t);if(r.status===429){await new Promise(r=>setTimeout(r,5000*(i+1)));continue;}if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}catch(e){if(i===ret)throw e;await new Promise(r=>setTimeout(r,3000*(i+1)));}}}

const CC={eurFcfa:656,usdEur:0.92,jpyEur:0.00625,aRate:0.03,transit:400,ded:100,dBase:0.20,tva:0.18,surV:0.05,surM:0.03,argus:0.15};
const PORTS={anvers:{l:"Anvers",f:1100,ti:450},rotterdam:{l:"Rotterdam",f:1050,ti:500},leHavre:{l:"Le Havre",f:1200,ti:350},barcelone:{l:"Barcelone",f:1400,ti:400},genes:{l:"Gênes",f:1350,ti:350},japon:{l:"Japon→Lomé",f:2200,ti:0},usa:{l:"USA→Lomé",f:3500,ti:0}};
const PAYS={"Allemagne":["anvers",200],"Belgique":["anvers",100],"Pays-Bas":["rotterdam",80],"France":["leHavre",150],"Espagne":["barcelone",300],"Italie":["genes",300],"Danemark":["anvers",400],"Japon":["japon",0],"USA":["usa",0]};
const T={"Toyota Hilux":{al:["hilux","toyota hilux","hilux vigo","hilux revo","hilux sr5","hilux invincible"],rMin:6500000,rMax:15000000,dem:"Très forte",vit:"< 2 sem",e:"🛻"},"Toyota RAV4":{al:["rav4","rav 4","toyota rav4","rav-4"],rMin:6000000,rMax:18000000,dem:"Forte",vit:"1-3 sem",e:"🚙"},"Toyota Land Cruiser":{al:["land cruiser","landcruiser","prado","lc70","lc200","j70","j200","hdj","kdj"],rMin:15000000,rMax:30000000,dem:"Très forte",vit:"< 1 sem",e:"🏔️"},"Hyundai Tucson":{al:["tucson","hyundai tucson","ix35"],rMin:8000000,rMax:14000000,dem:"Forte",vit:"2-3 sem",e:"🚗"},"Kia Sportage":{al:["sportage","kia sportage"],rMin:7000000,rMax:12000000,dem:"Moy-forte",vit:"2-4 sem",e:"🚗"},"Nissan Navara":{al:["navara","nissan navara","frontier","np300"],rMin:8000000,rMax:13000000,dem:"Forte",vit:"2-3 sem",e:"🛻"},"Mitsubishi L200":{al:["l200","mitsubishi l200","triton"],rMin:7000000,rMax:12000000,dem:"Forte",vit:"2-3 sem",e:"🛻"},"Ford Ranger":{al:["ranger","ford ranger"],rMin:7000000,rMax:13000000,dem:"Moy-forte",vit:"3-4 sem",e:"🛻"}};
const AVOID=[/peugeot\s*(1|2|3|5)0[0-9]/i,/renault\s*(clio|megane|twingo|zoe)/i,/citroen/i,/opel\b/i,/fiat/i,/dacia/i,/smart\b/i,/ford\s*ka\b/i,/audi\s*a[1-3]\b/i,/vw\s*polo\b/i,/seat\s*(ibiza|leon)/i,/toyota\s*(yaris|aygo)/i,/nissan\s*(micra|note|juke)/i,/hyundai\s*(i10|i20)/i,/kia\s*(picanto|rio)/i];
const MSGS={fr:{f:"🇫🇷",m:[{t:"Premier contact",b:v=>`Bonjour,\n\nVotre ${v.title}${v.price_eur?` à ${fmt(v.price_eur)} €`:""} m'intéresse.\n\nPouvez-vous confirmer :\n- Kilométrage exact\n- État mécanique\n- Historique accidents\n- Contrôle technique\n\nDisponible rapidement.\nCordialement`},{t:"Négociation",b:v=>`Bonjour,\n\nAprès étude du marché, je propose ${fmt(Math.round((v.price_eur||0)*0.87))} € pour un achat rapide. Virement immédiat.\n\nCordialement`}]},de:{f:"🇩🇪",m:[{t:"Erstkontakt",b:v=>`Guten Tag,\n\nIhr ${v.title} interessiert mich. Bitte bestätigen: Km-Stand, Zustand, Unfallhistorie, TÜV?\n\nMfG`},{t:"Verhandlung",b:v=>`Guten Tag,\n\nIch biete ${fmt(Math.round((v.price_eur||0)*0.87))} € bei sofortiger Überweisung.\n\nMfG`}]},nl:{f:"🇳🇱",m:[{t:"Contact",b:v=>`Goedendag,\n\nUw ${v.title} interesseert mij. Kunt u km-stand, staat en APK bevestigen?\n\nMvg`}]},en:{f:"🇬🇧",m:[{t:"Contact",b:v=>`Hello,\n\nInterested in your ${v.title}. Confirm mileage, condition, accident history?\n\nBest regards`}]}};

const fmt=n=>n?.toLocaleString("fr-FR")??"—";
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
function lev(a,b){if(!a.length)return b.length;if(!b.length)return a.length;const m=Array.from({length:b.length+1},(_,i)=>[i]);for(let j=0;j<=a.length;j++)m[0][j]=j;for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(b[i-1]===a[j-1]?0:1));return m[b.length][a.length];}
function matchT(raw){const n=norm(raw),tk=n.split(" ");let best=null,bs=0;for(const[name,d]of Object.entries(T))for(const al of d.al){const an=norm(al);if(n.includes(an)){const s=an.length*3;if(s>bs){bs=s;best={name,...d};}}else{const at=an.split(" "),tm=at.filter(a=>tk.some(t=>t===a||(t.length>3&&lev(t,a)<=1)));if(tm.length===at.length){const s=an.length*2;if(s>bs){bs=s;best={name,...d};}}}}return best;}
function isAv(t){return AVOID.some(p=>p.test(t)||p.test(norm(t)));}
function dCtry(loc){const l=norm(loc);const m={allemagne:"Allemagne",germany:"Allemagne",deutschland:"Allemagne",belgique:"Belgique",belgium:"Belgique","pays-bas":"Pays-Bas",nederland:"Pays-Bas",france:"France",espagne:"Espagne",italie:"Italie",japon:"Japon",japan:"Japon",usa:"USA"};for(const[k,v]of Object.entries(m))if(l.includes(k))return v;return"Allemagne";}
function calc(prix,country,opts={}){const[pk,coll]=PAYS[country]||["anvers",180];const port=PORTS[pk]||PORTS.anvers;const ti=opts.inclTI?port.ti:0;const a=Math.round(prix*CC.aRate),cif=prix+coll+port.f+a;const cifD=Math.round(cif*(1+CC.argus));let dr=CC.dBase;if(opts.year&&(new Date().getFullYear()-opts.year)>10)dr+=CC.surV;if(opts.cc&&opts.cc>3000)dr+=CC.surM;const d=Math.round(cifD*dr),t=Math.round((cifD+d)*CC.tva);return{total:prix+coll+port.f+a+ti+CC.transit+CC.ded+d+t,prix,coll,fret:port.f,a,ti,transit:CC.transit,ded:CC.ded,d,t,port:port.l,country,dr:Math.round(dr*100),sv:opts.year&&(new Date().getFullYear()-opts.year)>10,sm:opts.cc&&opts.cc>3000};}
function safeJSON(raw){if(!raw)return null;const c=raw.replace(/```json\s*/gi,"").replace(/```/g,"").trim();for(const p of[/(\{[\s\S]*\})/,/(\[[\s\S]*\])/]){const m=c.match(p);if(m){try{return JSON.parse(m[1]);}catch{}try{return JSON.parse(m[1].replace(/,\s*([}\]])/g,"$1").replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g,'$1"$2":').replace(/:\s*None/g,":null").replace(/:\s*True/g,":true").replace(/:\s*False/g,":false"));}catch{}}}return null;}
function valV(data){const r=data?.vehicles||data?.listings||data?.results||(Array.isArray(data)?data:[]);return r.filter(x=>x&&(x.title||x.name)).map(x=>({source:String(x.source||"?"),title:String(x.title||x.name||"?"),price_eur:parseFloat(String(x.price_eur||x.price||"0").replace(/[^0-9.]/g,""))||null,location:String(x.location||x.city||""),link:String(x.link||x.url||""),fuel:norm(x.fuel||"?"),year:parseInt(x.year||"0")||null,km:parseInt(String(x.km||x.mileage||"0").replace(/[^0-9]/g,""))||null,image_url:String(x.image_url||x.photo||""),visual_condition:String(x.visual_condition||""),accident_free:x.accident_free===true?true:x.accident_free===false?false:null,cc:parseInt(x.cylindree||"0")||null}));}
function analyze(v,inclTI=false){const tgt=matchT(v.title),bad=isAv(v.title),country=dCtry(v.location);const p=v.price_eur||0,co=p>0?calc(p,country,{year:v.year,cc:v.cc,inclTI}):null;const rMin=tgt?Math.round(tgt.rMin/CC.eurFcfa):0,rMax=tgt?Math.round(tgt.rMax/CC.eurFcfa):0;const mMin=co?rMin-co.total:0,mMax=co?rMax-co.total:0;let vd="?",sc=0;if(bad){vd="Éviter";sc=0;}else if(!tgt){vd="Hors cible";sc=5;}else if(!p){vd="Prix ?";sc=15;}else if(mMax<=0){vd="Perte";sc=10;}else if(mMin<=0){vd="Risqué";sc=40;}else if(mMin<=2000){vd="Rentable";sc=70;}else{vd="Très rentable";sc=95;}return{...v,tgt,bad,co,country,rMin,rMax,mMin,mMax,vd,sc};}
const apiTxt=d=>(d?.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
const DB={async get(k){try{const r=await window.storage?.get(k);return r?.value?JSON.parse(r.value):null;}catch{return null;}},async set(k,v){try{await window.storage?.set(k,JSON.stringify(v));}catch{}}};

// COLORS
const G="#D4A017",GL="#F5C842",D="#0A0A0A",D2="#111",D3="#1A1A1A",D4="#222",BD="#2A2A2A",TX="#E8E8E8",TM="#666",GR="#2ECC71",RD="#E74C3C",OR="#F39C12";
const vC=v=>v==="Très rentable"||v==="Rentable"?GR:v==="Risqué"?OR:v==="Perte"||v==="Éviter"?RD:TM;
const vB=v=>v==="Très rentable"||v==="Rentable"?`${GR}1A`:v==="Risqué"?`${OR}1A`:`${RD}1A`;

export default function App(){
  const[tab,setTab]=useState("home");const[logs,setLogs]=useState([]);const[busy,setBusy]=useState(false);const[results,setResults]=useState([]);const[favs,setFavs]=useState([]);const[cmp,setCmp]=useState([]);const[purchases,setPurchases]=useState([]);const[msgV,setMsgV]=useState(null);const[msgL,setMsgL]=useState("fr");const[simP,setSimP]=useState(7000);const[simV,setSimV]=useState("Toyota Hilux");const[simC,setSimC]=useState("Allemagne");const[simY,setSimY]=useState(2015);const[simCC,setSimCC]=useState(2400);const[inclTI,setInclTI]=useState(true);const[openC,setOpenC]=useState(null);
  const logRef=useRef(null);const log=useCallback((m,t="info")=>setLogs(p=>[...p.slice(-50),{m,t,ts:new Date().toLocaleTimeString("fr-FR")}]),[]);
  useEffect(()=>{logRef.current?.scrollTo(0,99999);},[logs]);
  useEffect(()=>{(async()=>{const f=await DB.get("bf7f");if(f)setFavs(f);const p=await DB.get("bf7p");if(p)setPurchases(p);})();},[]);
  useEffect(()=>{DB.set("bf7f",favs);},[favs]);useEffect(()=>{DB.set("bf7p",purchases);},[purchases]);
  const toggleFav=it=>{const k=`${it.title}-${it.price_eur}`;setFavs(p=>p.find(f=>f.k===k)?p.filter(f=>f.k!==k):[...p,{k,...it,at:Date.now()}]);};
  const isFav=it=>favs.some(f=>f.k===`${it.title}-${it.price_eur}`);

  const run=async(gmail=true)=>{setBusy(true);setTab("results");setResults([]);setLogs([]);log(`${gmail?"Gmail + ":""}Scan mondial`,"gold");let all=[];
    if(gmail){log("Lecture emails...","info");try{const d=await api({mcp_servers:[{type:"url",url:"https://gmail.mcp.claude.com/mcp",name:"gmail"}],messages:[{role:"user",content:`Agent sourcing BF Auto Market. Lis emails 3 derniers jours de: mobile.de, 2ememain, marktplaats, autoscout24, beforward, sbtjapan, leboncoin. Extrais véhicules avec prix. JSON: {"emails_read":0,"vehicles":[{"source":"","title":"","price_eur":null,"location":"","link":"","fuel":"","year":null,"km":null,"cylindree":null,"visual_condition":"","accident_free":null}],"link_only_emails":[{"source":"","subject":"","search_query":""}]}`}]});const p=safeJSON(apiTxt(d));if(p){all=valV(p);log(`${p.emails_read||"?"} emails → ${all.length} véhicule(s)`,"ok");}}catch(e){log(`Gmail: ${e.message}`,"err");}}
    log("Scan mondial...","info");for(const[lbl,q]of[["🇪🇺 Hilux","Toyota Hilux diesel occasion moins 10000 EUR Allemagne Belgique 2026"],["🇪🇺 RAV4","Toyota RAV4 diesel occasion moins 10000 EUR Allemagne 2026"],["🇪🇺 Tucson","Hyundai Tucson diesel occasion moins 10000 EUR Belgique 2026"],["🇯🇵 Hilux","beforward.jp Toyota Hilux diesel LHD under $7000"],["🇯🇵 Land Cruiser","beforward.jp Toyota Land Cruiser diesel LHD under $10000"],["🇯🇵 SBT","sbtjapan.com Toyota Hilux diesel left hand drive"],["🇪🇺 Sportage","Kia Sportage Nissan Navara diesel occasion moins 9000 EUR Europe"]]){log(lbl,"info");try{const d=await api({tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Sourcing auto Burkina. ${q}. Annonces réelles avec prix. JSON: {"vehicles":[{"source":"","title":"","price_eur":0,"year":0,"km":0,"fuel":"diesel","location":"","link":"","cylindree":null,"visual_condition":"","accident_free":null}]}`}]});const p=safeJSON(apiTxt(d));if(p){const v=valV(p);all=[...all,...v];if(v.length)log(`${v.length} trouvé(s)`,"ok");}}catch{}await new Promise(r=>setTimeout(r,1300));}
    if(all.length){const a=all.map(v=>analyze(v,inclTI)).sort((a,b)=>b.sc-a.sc);setResults(a);log(`${a.filter(x=>x.sc>=40).length} opportunité(s) sur ${a.length}`,"gold");}else log("Aucun résultat","warn");setBusy(false);};

  const st=T[simV]||Object.values(T)[0];const sco=calc(simP,simC,{year:simY,cc:simCC,inclTI});const srMin=Math.round(st.rMin/CC.eurFcfa),srMax=Math.round(st.rMax/CC.eurFcfa);const smMin=srMin-sco.total,smMax=srMax-sco.total;

  const Pill=({children,color=TM})=><span style={{fontSize:10,padding:"3px 10px",borderRadius:20,border:`1px solid ${color}44`,background:`${color}1A`,color,fontWeight:600,whiteSpace:"nowrap",fontFamily:"'DM Mono',monospace"}}>{children}</span>;
  const Btn=({children,onClick,color=TM,href,style:sx={}})=>{const p={padding:"6px 14px",borderRadius:8,border:`1px solid ${BD}`,background:"transparent",fontSize:12,cursor:"pointer",color,fontWeight:500,fontFamily:"'Syne',sans-serif",textDecoration:"none",display:"inline-block",...sx};return href?<a href={href} target="_blank" rel="noopener" style={p}>{children}</a>:<button onClick={onClick} style={p}>{children}</button>;};

  const Card=({it,idx})=>{const isO=openC===idx;return(
    <div style={{background:D3,border:`1px solid ${BD}`,borderRadius:12,padding:16,marginBottom:10}}>
      <div style={{display:"flex",gap:14}}>
        {it.image_url&&<div style={{width:80,height:60,borderRadius:8,overflow:"hidden",flexShrink:0,background:D4}}><img src={it.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.parentElement.style.display="none"}/></div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:140}}>
              <p style={{fontSize:14,fontWeight:700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.tgt?.e||"🚗"} {it.title}</p>
              <p style={{fontSize:11,color:TM,margin:"3px 0 0",fontFamily:"'DM Mono',monospace"}}>{it.source} · {it.country} {it.year?`· ${it.year}`:""} {it.km?`· ${fmt(it.km)} km`:""} · {it.fuel}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <p style={{fontSize:20,fontWeight:800,margin:0,color:G,fontFamily:"'DM Mono',monospace"}}>{it.price_eur?`${fmt(it.price_eur)} €`:"—"}</p>
              {it.co&&<p style={{fontSize:10,color:TM,margin:0,fontFamily:"'DM Mono',monospace"}}>Ouaga: {fmt(it.co.total)} €</p>}
            </div>
          </div>
          <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
            <Pill color={vC(it.vd)}>{it.vd}</Pill>
            {it.mMax>0&&<Pill color={GR}>+{fmt(it.mMax)} €</Pill>}
            {it.tgt&&<Pill color={G}>{it.tgt.dem}</Pill>}
            {it.accident_free===true&&<Pill color={GR}>Sans accident</Pill>}
            {it.accident_free===false&&<Pill color={RD}>Accidenté</Pill>}
            {it.bad&&<Pill color={RD}>⛔ Pas pour BF</Pill>}
          </div>
          <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
            {it.co&&<Btn onClick={()=>setOpenC(isO?null:idx)}>{isO?"Masquer":"Coûts"}</Btn>}
            <Btn onClick={()=>toggleFav(it)} color={isFav(it)?RD:TM}>{isFav(it)?"★":"☆"}</Btn>
            <Btn onClick={()=>setCmp(p=>p.length>=3?[...p.slice(1),it]:[...p,it])}>⚖</Btn>
            <Btn onClick={()=>{setMsgV(it);setTab("msg");}}>✉</Btn>
            {it.link&&<Btn href={it.link}>Voir ↗</Btn>}
            <Btn href="https://www.carvertical.com/fr" color={G}>VIN</Btn>
          </div>
        </div>
      </div>
      {isO&&it.co&&<div style={{marginTop:14,padding:14,background:D2,borderRadius:10,border:`1px solid ${BD}`}}>
        {[["Achat",it.co.prix],[`Collecte ${it.co.country}`,it.co.coll],it.co.ti>0?["St-Étienne→port",it.co.ti]:null,[`Fret ${it.co.port}`,it.co.fret],["Assurance 3%",it.co.a],["Transit Lomé→Ouaga",it.co.transit],["Dédouanement",it.co.ded],[`Douane ${it.co.dr}% (argus +15%)`,it.co.d],["TVA 18%",it.co.t]].filter(Boolean).map(([l,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${BD}`,fontSize:12}}><span style={{color:TM}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace"}}>{fmt(v)} €</span></div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:800,fontSize:15,borderTop:`2px solid ${TM}`,marginTop:6}}><span>TOTAL</span><span style={{color:G,fontFamily:"'DM Mono',monospace"}}>{fmt(it.co.total)} € = {fmt(Math.round(it.co.total*CC.eurFcfa))} F</span></div>
        {it.co.sv&&<p style={{color:OR,fontSize:11,margin:"4px 0 0"}}>+5% surcharge &gt;10 ans</p>}
        {it.tgt&&<p style={{color:GR,fontWeight:700,fontSize:13,margin:"8px 0 0"}}>Marge: {fmt(it.mMin)} → +{fmt(it.mMax)} € ({fmt(Math.round(it.mMin*CC.eurFcfa))} → {fmt(Math.round(it.mMax*CC.eurFcfa))} FCFA)</p>}
      </div>}
    </div>);};

  const TABS=[{id:"home",l:"Accueil",i:"⌂"},{id:"results",l:"Résultats",i:"◎"},{id:"favs",l:`★ ${favs.length}`,i:""},{id:"compare",l:"⚖",i:""},{id:"msg",l:"✉",i:""},{id:"sim",l:"Simulateur",i:"⊞"},{id:"track",l:`$ ${purchases.length}`,i:""}];

  return(<div style={{fontFamily:"'Syne',sans-serif",maxWidth:900,margin:"0 auto",background:D,color:TX,minHeight:"100vh"}}>
    {/* HEADER */}
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:`1px solid ${BD}`,background:D2,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,background:G,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🚗</div>
        <span style={{fontSize:18,fontWeight:800,letterSpacing:-0.5}}>BF <span style={{color:G}}>AUTO</span> MARKET</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {busy&&<div style={{width:16,height:16,border:`2px solid ${BD}`,borderTop:`2px solid ${G}`,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>}
        <span style={{background:`${G}22`,border:`1px solid ${G}44`,color:G,padding:"4px 12px",borderRadius:20,fontSize:10,fontWeight:600,letterSpacing:1,fontFamily:"'DM Mono',monospace"}}>⚡ AGENT IA V7</span>
      </div>
    </header>
    {/* NAV */}
    <nav style={{display:"flex",overflowX:"auto",gap:2,padding:"0 16px",borderBottom:`1px solid ${BD}`,background:D2}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 14px",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:4,borderBottom:tab===t.id?`2px solid ${G}`:"2px solid transparent",color:tab===t.id?G:TM,fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:tab===t.id?700:500,whiteSpace:"nowrap"}}>{t.i} {t.l}</button>)}
    </nav>
    <main style={{padding:24}}>
      {/* HOME */}
      {tab==="home"&&<div>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:G,letterSpacing:3,marginBottom:12}}>INTELLIGENCE ARTIFICIELLE</p>
        <h1 style={{fontSize:28,fontWeight:800,letterSpacing:-1,lineHeight:1.2,marginBottom:12}}>Trouve les meilleures<br/>affaires en <span style={{color:G}}>Europe, Japon & USA</span></h1>
        <p style={{color:TM,fontSize:14,marginBottom:24,lineHeight:1.6}}>L'agent scanne Mobile.de, AutoScout24, 2ememain, BE FORWARD, SBT Japan et calcule ta marge rendu Ouaga.</p>
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>{["Mobile.de","AutoScout24","2ememain","Marktplaats","BE FORWARD","SBT Japan","LeBonCoin","BCA"].map(s=><span key={s} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,border:`1px solid ${BD}`,background:D3,fontSize:11,color:TM,fontFamily:"'DM Mono',monospace"}}><span style={{width:6,height:6,borderRadius:"50%",background:GR,display:"inline-block"}}/>{s}</span>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <button onClick={()=>run(true)} disabled={busy} style={{padding:20,borderRadius:12,border:`1px solid ${G}44`,background:D3,cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:4,color:TX,fontFamily:"'Syne',sans-serif"}}><span style={{fontSize:24}}>📧</span><span style={{fontSize:15,fontWeight:700}}>Gmail + Scan mondial</span><span style={{fontSize:11,color:TM}}>Emails + Europe + Japon + USA</span></button>
          <button onClick={()=>run(false)} disabled={busy} style={{padding:20,borderRadius:12,border:`1px solid ${BD}`,background:D3,cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:4,color:TX,fontFamily:"'Syne',sans-serif"}}><span style={{fontSize:24}}>🔍</span><span style={{fontSize:15,fontWeight:700}}>Scan rapide</span><span style={{fontSize:11,color:TM}}>Web direct</span></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["sim","🧮 Simulateur"],["favs","★ Favoris"],["track","💰 Achats"]].map(([id,l])=><button key={id} onClick={()=>setTab(id)} style={{padding:10,borderRadius:8,border:`1px solid ${BD}`,background:D3,cursor:"pointer",fontSize:11,fontWeight:600,color:TX,fontFamily:"'Syne',sans-serif"}}>{l}</button>)}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:TM,marginTop:14,cursor:"pointer"}}><input type="checkbox" checked={inclTI} onChange={e=>setInclTI(e.target.checked)} style={{accentColor:G}}/> Inclure transport St-Étienne → port</label>
      </div>}
      {/* RESULTS */}
      {tab==="results"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:20,fontWeight:700,margin:0}}>{results.length} résultat{results.length!==1?"s":""}</h2><div style={{display:"flex",gap:6}}><Btn onClick={()=>run(true)} color={G}>📧</Btn><Btn onClick={()=>run(false)}>🔍</Btn></div></div>
        <div ref={logRef} style={{background:D2,borderRadius:10,padding:12,marginBottom:14,maxHeight:110,overflowY:"auto",fontSize:11,fontFamily:"'DM Mono',monospace",border:`1px solid ${BD}`}}>{logs.length===0?<span style={{color:TM}}>En attente...</span>:logs.map((l,i)=><div key={i} style={{color:l.t==="ok"?GR:l.t==="err"?RD:l.t==="warn"?OR:l.t==="gold"?G:TM}}><span style={{opacity:.4}}>[{l.ts}]</span> {l.m}</div>)}</div>
        {results.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>{[[results.filter(r=>r.sc>=40).length,"Opportunités",GR],[results.filter(r=>r.bad).length,"Éviter",RD],[results.filter(r=>r.vd==="Perte").length,"Pertes",TM],[results.length,"Total",G]].map(([v,l,c],i)=><div key={i} style={{background:D3,borderRadius:10,padding:12,textAlign:"center",border:`1px solid ${c}33`}}><p style={{fontSize:24,fontWeight:800,color:c,margin:0,fontFamily:"'DM Mono',monospace"}}>{v}</p><p style={{fontSize:9,color:c,margin:0,letterSpacing:1,textTransform:"uppercase"}}>{l}</p></div>)}</div>}
        {results.map((it,i)=><Card key={i} it={it} idx={i}/>)}
      </div>}
      {/* FAVS */}
      {tab==="favs"&&<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:14}}>★ Favoris ({favs.length})</h2>{favs.length===0?<p style={{textAlign:"center",padding:40,color:TM}}>Sauvegarde des annonces avec ★</p>:favs.map((f,i)=><Card key={i} it={f} idx={`f${i}`}/>)}</div>}
      {/* COMPARE */}
      {tab==="compare"&&<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:14}}>⚖ Comparateur</h2>{cmp.length<2?<p style={{textAlign:"center",padding:40,color:TM}}>Ajoute 2-3 véhicules avec ⚖</p>:<div style={{overflowX:"auto",borderRadius:10,border:`1px solid ${BD}`}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:D3}}><th style={{padding:"10px 14px",textAlign:"left",fontSize:12}}></th>{cmp.map((c,i)=><th key={i} style={{padding:"10px 14px",textAlign:"left",fontSize:12,color:G,fontWeight:700}}>{c.tgt?.e} {c.title?.split(" ").slice(0,3).join(" ")}</th>)}</tr></thead><tbody>{[["Prix",c=>c.price_eur?fmt(c.price_eur)+"€":"?"],["Année",c=>c.year||"?"],["Km",c=>c.km?fmt(c.km):"?"],["Pays",c=>c.country],["Ouaga",c=>c.co?fmt(c.co.total)+"€":"—"],["Marge",c=>c.mMax?(c.mMax>0?"+":"")+fmt(c.mMax)+"€":"—"],["Verdict",c=>c.vd],["Demande",c=>c.tgt?.dem||"—"]].map(([l,fn],j)=><tr key={j} style={{borderTop:`1px solid ${BD}`}}><td style={{padding:"8px 14px",color:TM,fontSize:12}}>{l}</td>{cmp.map((c,i)=><td key={i} style={{padding:"8px 14px",fontSize:12,color:l==="Verdict"?vC(c.vd):l==="Marge"?(c.mMax>0?GR:RD):TX,fontWeight:l==="Verdict"||l==="Marge"?700:400,fontFamily:l==="Prix"||l==="Ouaga"||l==="Marge"?"'DM Mono',monospace":"inherit"}}>{fn(c)}</td>)}</tr>)}</tbody></table></div>}</div>}
      {/* MSG */}
      {tab==="msg"&&<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:14}}>✉ Messages vendeur</h2>{!msgV?<p style={{textAlign:"center",padding:40,color:TM}}>Clique ✉ sur une annonce</p>:<div><div style={{background:D3,border:`1px solid ${G}44`,borderRadius:10,padding:14,marginBottom:14}}><p style={{margin:0}}>Pour : <strong style={{color:G}}>{msgV.title}</strong> — {msgV.price_eur?fmt(msgV.price_eur)+" €":"?"}</p></div><div style={{display:"flex",gap:6,marginBottom:14}}>{Object.entries(MSGS).map(([k,v])=><Btn key={k} onClick={()=>setMsgL(k)} color={msgL===k?G:TM}>{v.f}</Btn>)}</div>{MSGS[msgL]?.m.map((m,i)=><div key={i} style={{background:D3,border:`1px solid ${BD}`,borderRadius:10,padding:14,marginBottom:10}}><p style={{margin:"0 0 8px",fontWeight:700,color:G}}>{m.t}</p><textarea readOnly value={m.b(msgV)} style={{width:"100%",minHeight:120,border:`1px solid ${BD}`,borderRadius:10,padding:14,fontSize:12,fontFamily:"'Syne',sans-serif",resize:"vertical",boxSizing:"border-box",background:D2,color:TX}}/><Btn onClick={()=>navigator.clipboard?.writeText(m.b(msgV))} color={GR} style={{marginTop:8}}>📋 Copier</Btn></div>)}</div>}</div>}
      {/* SIM */}
      {tab==="sim"&&<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:14}}>🧮 Simulateur</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:D3,border:`1px solid ${BD}`,borderRadius:12,padding:16}}>
          <label style={{fontSize:12,color:TM,display:"block",marginBottom:4}}>Véhicule</label><select value={simV} onChange={e=>setSimV(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:`1px solid ${BD}`,fontSize:13,marginBottom:10,background:D4,color:TX,fontFamily:"'Syne',sans-serif"}}>{Object.keys(T).map(v=><option key={v}>{v}</option>)}</select>
          <label style={{fontSize:12,color:TM,display:"block",marginBottom:4}}>Pays</label><select value={simC} onChange={e=>setSimC(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:`1px solid ${BD}`,fontSize:13,marginBottom:10,background:D4,color:TX,fontFamily:"'Syne',sans-serif"}}>{Object.keys(PAYS).map(c=><option key={c}>{c}</option>)}</select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}><div><label style={{fontSize:12,color:TM,display:"block",marginBottom:4}}>Année</label><input type="number" value={simY} onChange={e=>setSimY(+e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:`1px solid ${BD}`,fontSize:13,background:D4,color:TX,boxSizing:"border-box",fontFamily:"'DM Mono',monospace"}}/></div><div><label style={{fontSize:12,color:TM,display:"block",marginBottom:4}}>Cylindrée</label><input type="number" value={simCC} onChange={e=>setSimCC(+e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:`1px solid ${BD}`,fontSize:13,background:D4,color:TX,boxSizing:"border-box",fontFamily:"'DM Mono',monospace"}}/></div></div>
          <label style={{fontSize:12,color:TM}}>Prix : <span style={{color:G,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{fmt(simP)} €</span></label><input type="range" min={1000} max={25000} step={100} value={simP} onChange={e=>setSimP(+e.target.value)} style={{width:"100%",accentColor:G,marginTop:4}}/>
          <div style={{marginTop:12,background:D2,borderRadius:8,padding:10,border:`1px solid ${BD}`}}><p style={{margin:0,fontWeight:700,color:G}}>{st.e} {simV}</p><p style={{margin:"4px 0 0",fontSize:12,color:TM}}>Demande : {st.dem} · {st.vit}</p><p style={{margin:"2px 0 0",fontSize:12,color:TM,fontFamily:"'DM Mono',monospace"}}>Revente : {fmt(st.rMin)} – {fmt(st.rMax)} F</p></div>
        </div>
        <div style={{background:D3,border:`1px solid ${smMin>0?`${GR}44`:`${RD}44`}`,borderRadius:12,padding:16}}>
          <p style={{fontSize:11,fontWeight:700,color:TM,margin:"0 0 10px",letterSpacing:1,textTransform:"uppercase"}}>Via {sco.port}</p>
          {[["Achat",sco.prix],["Collecte",sco.coll],sco.ti>0?["St-Étienne→port",sco.ti]:null,[`Fret`,sco.fret],["Assurance",sco.a],["Transit",sco.transit],["Dédouanement",sco.ded],[`Douane ${sco.dr}%`,sco.d],["TVA 18%",sco.t]].filter(Boolean).map(([l,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${BD}`,fontSize:12}}><span style={{color:TM}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace"}}>{fmt(v)} €</span></div>)}
          {sco.sv&&<p style={{color:OR,fontSize:10,margin:"4px 0 0"}}>+5% véhicule &gt;10 ans</p>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:800,fontSize:15,borderTop:`2px solid ${TM}`,marginTop:6}}><span>TOTAL</span><span style={{color:G,fontFamily:"'DM Mono',monospace"}}>{fmt(sco.total)} €</span></div>
          <p style={{textAlign:"right",fontSize:10,color:TM,margin:"2px 0 0",fontFamily:"'DM Mono',monospace"}}>{fmt(Math.round(sco.total*CC.eurFcfa))} FCFA</p>
          <div style={{marginTop:14,background:`${smMin>0?GR:RD}0D`,borderRadius:10,padding:16,textAlign:"center",border:`1px solid ${smMin>0?GR:RD}33`}}>
            <p style={{fontSize:28,fontWeight:800,color:smMin>0?GR:RD,margin:0,fontFamily:"'DM Mono',monospace"}}>{smMin>0?"+":""}{fmt(smMax)} €</p>
            <p style={{fontSize:11,color:TM,margin:"4px 0 8px",fontFamily:"'DM Mono',monospace"}}>{fmt(Math.round(smMin*CC.eurFcfa))} → {fmt(Math.round(smMax*CC.eurFcfa))} FCFA</p>
            <Pill color={vC(smMin>2000?"Très rentable":smMin>0?"Rentable":smMax>0?"Risqué":"Perte")}>{smMin>2000?"Très rentable":smMin>0?"Rentable":smMax>0?"Risqué":"Perte"}</Pill>
          </div>
        </div>
      </div></div>}
      {/* TRACK */}
      {tab==="track"&&<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:14}}>💰 Achats</h2>
        <Btn onClick={()=>{const t=prompt("Véhicule ?");if(!t)return;const p=parseFloat(prompt("Prix (€)")||"0"),c=prompt("Pays")||"Allemagne",rv=parseFloat(prompt("Revente FCFA (0=pas vendu)")||"0"),y=parseInt(prompt("Année")||"2015"),cc=parseInt(prompt("Cylindrée")||"2400");setPurchases(prev=>[...prev,{titre:t,pa:p,pays:c,rv,y,cc,date:new Date().toISOString(),co:calc(p,c,{year:y,cc,inclTI})}]);}} color={GR} style={{marginBottom:14}}>+ Nouvel achat</Btn>
        {purchases.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>{[[fmt(purchases.reduce((a,p)=>a+p.pa,0))+"€","Investi",OR],[fmt(purchases.reduce((a,p)=>a+(p.rv?Math.round(p.rv/CC.eurFcfa)-p.co.total:0),0))+"€","Marge",GR],[`${purchases.filter(p=>p.rv>0).length}/${purchases.length}`,"Vendus",G]].map(([v,l,c],i)=><div key={i} style={{background:D3,borderRadius:10,padding:12,textAlign:"center",border:`1px solid ${c}33`}}><p style={{fontSize:18,fontWeight:800,color:c,margin:0,fontFamily:"'DM Mono',monospace"}}>{v}</p><p style={{fontSize:9,color:c,margin:0,letterSpacing:1,textTransform:"uppercase"}}>{l}</p></div>)}</div>}
        {purchases.length===0?<p style={{textAlign:"center",padding:40,color:TM}}>Aucun achat</p>:purchases.map((p,i)=><div key={i} style={{background:D3,border:`1px solid ${BD}`,borderRadius:10,padding:14,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div><p style={{margin:0,fontWeight:700}}>{p.titre}</p><p style={{margin:0,fontSize:11,color:TM}}>{p.pays} · {new Date(p.date).toLocaleDateString("fr-FR")}</p></div><div style={{textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:13}}><p style={{margin:0}}>Achat: <strong>{fmt(p.pa)}€</strong> → Ouaga: <strong>{fmt(p.co.total)}€</strong></p>{p.rv>0?<p style={{margin:0,color:GR,fontWeight:700}}>Vendu {fmt(p.rv)}F → +{fmt(Math.round(p.rv/CC.eurFcfa)-p.co.total)}€</p>:<p style={{margin:0,color:OR}}>En attente</p>}</div></div><Btn onClick={()=>setPurchases(prev=>prev.filter((_,j)=>j!==i))} color={RD} style={{marginTop:8}}>Supprimer</Btn></div>)}
      </div>}
    </main>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:640px){main>div>div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
  </div>);
}

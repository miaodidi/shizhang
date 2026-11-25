export const APP_VERSION=__APP_VERSION__;
let registration,checking,waiting,requested=false,reloadReady=false;
let status='打开设置时自动检查更新';
const listeners=new Set();
const publish=message=>{status=message;listeners.forEach(fn=>fn());};
export const updateStateView=()=>({status,ready:!!waiting||reloadReady,checking:!!checking,version:APP_VERSION});
export function observeUpdates(fn){listeners.add(fn);return()=>listeners.delete(fn);}
function watch(reg){
 const refresh=()=>{waiting=reg.waiting;if(waiting)publish('新版本已下载，点击立即更新');};
 const installing=()=>{const worker=reg.installing;if(!worker)return;publish('正在下载新版本…');worker.addEventListener('statechange',()=>{if(worker.state==='installed'){refresh();if(!waiting)publish('离线资源已准备好');}if(worker.state==='redundant')publish('新版本下载失败，请重试');});};
 reg.addEventListener('updatefound',installing);refresh();installing();return reg;
}
export function registerUpdates(){
 if(!import.meta.env.PROD||!('serviceWorker'in navigator))return Promise.resolve(null);
 if(!registration)registration=navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(watch).catch(e=>{registration=null;publish('离线资源未准备好，请联网后重试');throw e;});
 return registration;
}
function workerVersion(worker){return new Promise(resolve=>{if(!worker)return resolve(null);const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.version);};worker.postMessage({type:'GET_VERSION'},[channel.port2]);});}
export function checkUpdates(){
 if(checking)return checking;
 checking=(async()=>{
  publish('正在联网检查…');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{
   if(!import.meta.env.PROD){publish('开发预览模式，发布版本支持在线更新');return;}
   const response=await fetch(`./version.json?t=${Date.now()}`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('network');const latest=await response.json();
   const reg=await registerUpdates();if(!reg)throw Error('unavailable');
   await Promise.race([reg.update(),new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}))]);
   waiting=reg.waiting;
   if(waiting)publish('新版本已下载，点击立即更新');
   else if(reg.installing)publish('正在下载新版本…');
   else if(latest.version!==APP_VERSION){reloadReady=await workerVersion(reg.active)===latest.version;publish(reloadReady?'新版本已就绪，点击立即更新':'发现新版本，正在准备；稍后再检查');}
   else publish('已检查，当前是最新版本');
  }catch{publish(waiting?'新版本已下载，可离线更新':'暂时无法检查更新，请联网后重试');}
  finally{clearTimeout(timer);checking=null;listeners.forEach(fn=>fn());}
 })();return checking;
}
export function applyUpdate(){
 if(waiting){requested=true;publish('正在更新…');waiting.postMessage({type:'SKIP_WAITING'});}
 else if(reloadReady)location.reload();
}
navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(requested)location.reload();});

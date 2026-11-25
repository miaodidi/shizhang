import {getSvgPath} from 'figma-squircle';

const selector='.account-card,.white-card,.summary-card,.profile-card';
const observed=new Set();
// SVG paths give Safari the same smoothed geometry, without relying on corner-shape support.
function shape(element){
 const {width,height}=element.getBoundingClientRect();
 if(!width||!height)return;
 const radius=Number(element.dataset.cornerRadius);
 const size=`${width}:${height}:${radius}`;
 if(element.dataset.cornerSize===size)return;
 const path=getSvgPath({width,height,cornerRadius:radius,cornerSmoothing:.65,preserveSmoothing:true});
 element.style.clipPath=`path('${path}')`;
 element.style.webkitClipPath=`path('${path}')`;
 if(element.matches('.account-card')){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" fill="none" stroke="white" stroke-opacity=".7" stroke-width="1.4"/></svg>`;
  element.style.setProperty('--edge-image',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
 }
 element.classList.add('continuous-card');element.dataset.cornerSize=size;
}
const observer=new ResizeObserver(entries=>{for(const {target} of entries)shape(target);});
export function refreshContinuousCorners(root){
 for(const element of observed){if(!element.isConnected){observer.unobserve(element);observed.delete(element);}}
 for(const element of root.querySelectorAll(selector)){
  if(observed.has(element))continue;
  element.dataset.cornerRadius=parseFloat(getComputedStyle(element).borderTopLeftRadius)||24;
  shape(element);observed.add(element);observer.observe(element);
 }
}

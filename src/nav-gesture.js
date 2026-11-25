// Keep pointer feedback within the nav; switch content only after release.
export function enableNavDrag(onSelect){
 let gesture=null,suppressUntil=0;
 const reset=()=>{if(!gesture)return;const {nav}=gesture;nav.classList.remove('dragging');nav.style.removeProperty('--drag-x');nav.querySelectorAll('button').forEach(b=>b.classList.remove('drag-target'));gesture=null;};
 document.addEventListener('pointerdown',e=>{const button=e.target.closest('.bottom-nav button');if(!button||!e.isPrimary||e.button!==0)return;const nav=button.closest('nav');gesture={nav,id:e.pointerId,startX:e.clientX,startY:e.clientY,dragged:false,target:button};});
 document.addEventListener('pointermove',e=>{const g=gesture;if(!g||g.id!==e.pointerId)return;
  if(!g.dragged){if(Math.abs(e.clientY-g.startY)>Math.abs(e.clientX-g.startX)+8){reset();return;}if(Math.abs(e.clientX-g.startX)<7)return;g.dragged=true;g.nav.setPointerCapture(e.pointerId);g.nav.classList.add('dragging');}
  const rect=g.nav.getBoundingClientRect(),width=(rect.width-12)/4,x=Math.max(0,Math.min(rect.width-12-width,e.clientX-rect.left-6-width/2));
  g.nav.style.setProperty('--drag-x',`${x}px`);const buttons=[...g.nav.querySelectorAll('button')];const index=Math.max(0,Math.min(3,Math.floor((e.clientX-rect.left-6)/width)));g.target=buttons[index];buttons.forEach(b=>b.classList.toggle('drag-target',b===g.target));
 });
 document.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const g=gesture;const rect=g.nav.getBoundingClientRect();const inside=e.clientY>=rect.top-20&&e.clientY<=rect.bottom+20&&e.clientX>=rect.left-20&&e.clientX<=rect.right+20;reset();if(g.dragged){suppressUntil=performance.now()+500;if(inside)onSelect(g.target.dataset.tab);}});
 document.addEventListener('pointercancel',reset);document.addEventListener('lostpointercapture',reset);
 document.addEventListener('click',e=>{if(performance.now()<suppressUntil&&e.target.closest('.bottom-nav')){e.preventDefault();e.stopImmediatePropagation();}},true);
}

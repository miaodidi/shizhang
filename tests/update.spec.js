import {test,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
test('a waiting release activates only on update click and preserves the ledger',async({page})=>{
 let latest=false;const version='2026.11.25.2',previous='2026.11.25.1';
 const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'index.html':url.pathname.slice(1);let data=await fs.readFile(path.join(process.cwd(),'dist',file));const type=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/plain';if(!latest&&['text/javascript','text/html','application/json'].includes(type)){let text=data.toString().replaceAll(version,previous);if(file==='sw.js')text=text.replace("CACHE='shizhang-","CACHE='shizhang-previous-");data=Buffer.from(text);}res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 await page.locator('[aria-label="记一笔"]').click();await page.locator('[name=amount]').fill('25');await page.locator('[name=note]').fill('更新前账单');await page.getByRole('button',{name:'记好了',exact:true}).click();await expect(page.getByText('更新前账单',{exact:true})).toBeVisible();
 latest=true;await page.locator('nav [data-tab=settings]').click();await expect(page.locator('#update-panel')).toContainText(previous);await expect(page.locator('[data-action=apply-update]')).toBeVisible();
 await page.locator('[data-action=apply-update]').click();await expect(page.getByText('更新前账单',{exact:true})).toBeVisible();await page.locator('nav [data-tab=settings]').click();await expect(page.locator('#update-panel')).toContainText(version);await expect(page.locator('#update-panel')).toContainText('当前是最新版本');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

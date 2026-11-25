import {test,expect} from '@playwright/test';
test('four pages fit phone and category details return to parent',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?demo=1');
 for(const tab of ['home','flow','bills','settings']){
 await page.locator(`[data-tab="${tab}"]`).last().click();
 await expect(page.locator('h1')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`screenshots/${tab}.png`,fullPage:true});
 }
 await page.locator('[data-tab=bills]').click();await page.locator('[data-action=category]').first().click();
 await expect(page.getByRole('dialog')).toHaveAttribute('aria-label',/支出明细/);
 await page.locator('.sheet [data-action=transaction]').first().click();await expect(page.getByRole('dialog')).toHaveAttribute('aria-label','账单详情');
 await page.locator('.close-modal').click();await expect(page.getByRole('dialog')).toHaveAttribute('aria-label',/支出明细/);
 await page.locator('.close-modal').click();await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(errors).toEqual([]);
});
test('ledger persists, demo isolated, backup restores and offline works',async({page,context})=>{
 await page.goto('/');await expect(page.getByText('从第一笔开始')).toBeVisible();
 await page.locator('[aria-label="记一笔"]').click();await page.locator('[name=amount]').fill('15.90');await page.locator('[name=note]').fill('测试午餐');await page.getByRole('button',{name:'记好了',exact:true}).click();
 await expect(page.getByText('测试午餐',{exact:true})).toBeVisible();await page.reload();await expect(page.getByText('测试午餐',{exact:true})).toBeVisible();
 await page.locator('[data-tab=settings]').click();await page.locator('[data-action=backup]').click();
 const dl=page.waitForEvent('download');await page.locator('.sheet [data-action=export]').click();const file=await dl;await file.saveAs('test-results/backup.json');
 await page.locator('[name=file]').setInputFiles('test-results/backup.json');await page.getByRole('button',{name:'读取备份'}).click();await page.getByRole('button',{name:'替换并恢复'}).click();
 await page.locator('[data-action=demo]').click();await expect(page.locator('.demo-banner')).toBeVisible();
 await page.locator('.demo-banner button').click();await expect(page.getByText('测试午餐',{exact:true})).toBeVisible();await expect(page.getByText('周末的鲜花',{exact:true})).toHaveCount(0);
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await expect(page.getByText('测试午餐',{exact:true})).toBeVisible();
 await page.locator('nav [data-tab=flow]').click();await page.locator('#search').fill('午餐');await expect(page.getByText('测试午餐',{exact:true})).toBeVisible();await page.locator('#search').fill('找不到');await expect(page.getByText('没有找到记录')).toBeVisible();
});
test('transfer, category and theme settings work',async({page})=>{
 await page.goto('/?demo=1');await page.locator('[data-action=new][data-type=transfer]').click();await page.locator('[name=amount]').fill('100');await page.locator('[name=note]').fill('账户转账验证');await page.getByRole('button',{name:'记好了',exact:true}).click();await expect(page.getByText('账户转账验证',{exact:true})).toBeVisible();
 await page.locator('[data-tab=settings]').click();await page.locator('[data-action=categories]').click();await page.locator('[name=name]').fill('自定义分类');await page.getByRole('button',{name:'新增分类',exact:true}).click();await expect(page.getByText('自定义分类',{exact:true})).toBeVisible();await page.locator('.close-modal').click();
 await page.locator('[data-theme=dark]').last().click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.screenshot({path:'screenshots/settings-dark.png',fullPage:true});
});

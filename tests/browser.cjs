const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const context=await browser.newContext();const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base=process.env.DEMO_URL||'http://127.0.0.1:8000/';const go=page=>p.goto(base+'nirmaan-setu-'+page+'.html',{waitUntil:'domcontentloaded'});
 await go('site-report');await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>navigator.serviceWorker.controller);
 await p.locator('#location').fill('Ch. 14+280 P7');await p.locator('#body').fill('P7 pile cap concrete pour completed. Crane idle for two hours.');
 await p.locator('#save-local').click();assert.equal(await p.locator('#save-local').innerText(),'Saved on device');await p.reload({waitUntil:'domcontentloaded'});assert.match(await p.locator('#body').inputValue(),/Crane idle/);
 await context.setOffline(true);await p.locator('button[type=submit]').click();await p.waitForURL('**/*match-confirmation.html');assert.match(await p.locator('#demo-status').innerText(),/1 pending/);
 await p.reload({waitUntil:'domcontentloaded'});assert.match(await p.locator('main').innerText(),/Waiting for connection/);
 await context.setOffline(false);await p.waitForFunction(()=>document.querySelector('#demo-status').textContent.includes('0 pending'));await p.locator('.task-choice[value="4.2.1"]').check();await p.locator('.task-choice[value="5.1.0"]').check();await p.locator('#confirm-tasks').click();await p.waitForURL('**/*planner-review.html');
 const dashboard=await context.newPage();await dashboard.goto(base+'nirmaan-setu-dashboard.html');assert.equal(await dashboard.locator('.confirmed .stat-num').innerText(),'18');
 await p.locator('[data-approve]').first().click();await dashboard.waitForFunction(()=>document.querySelector('.confirmed .stat-num').textContent==='19');assert.match(await p.locator('#demo-message').innerText(),/19/);
 await p.getByText('View crane conflict',{exact:true}).click();await p.waitForURL('**/*delay-conflict.html?*');assert.match(await p.locator('main').innerText(),/14:00–18:00/);await p.locator('[data-reject]').click();
 await go('history');assert.match(await p.locator('#audit-list').innerText(),/Planner approved/);assert.match(await p.locator('#audit-list').innerText(),/Planner rejected/);
 await p.locator('#reset-demo').click();await p.waitForURL('**/*site-report.html');assert.equal(await p.locator('#body').inputValue(),'');await dashboard.waitForFunction(()=>document.querySelector('.confirmed .stat-num').textContent==='18');
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: draft reload, offline submit/reload, reconnect, dynamic matches, confirmation, cross-tab 18→19, crane flow, rejection, audit, reset; no page errors.');
})().catch(e=>{console.error(e);process.exit(1);});

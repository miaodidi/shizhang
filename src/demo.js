import {initialState,uid,today,monthNow,shiftMonth} from './model.js';
export function demoState(){
 const s=initialState();s.settings.name='Didi';
 s.accounts=[{id:'daily',name:'日常账户',kind:'银行卡',opening:1200000},{id:'wx',name:'微信',kind:'微信',opening:180000},{id:'ali',name:'支付宝',kind:'支付宝',opening:350000}];
 const add=(date,name,amount,category='餐饮',accountId='daily',type='expense')=>s.transactions.push({id:uid(),date,type,amount:Math.round(amount*100),categoryId:s.categories.find(c=>c.name===category&&c.type===type)?.id||'e0',accountId,note:name,createdAt:date+'T12:00:00Z'});
 const m=monthNow(),d=Number(today().slice(-2)),date=n=>m+'-'+String(Math.max(1,Math.min(n,d))).padStart(2,'0');
 [['京都抹茶拿铁',28,'饮料','wx',d],['周末的鲜花',68,'购物','ali',d],['一碗热气腾腾的牛肉面',32,'餐饮','wx',d-1],['回家的地铁',6,'交通','ali',d-1],['索尼 WH-1000XM5',1899,'数码','ali',d-3],['这个月的房租',2800,'居住','daily',1],['无印良品 · 日常补给',168,'购物','ali',d-6],['朋友小聚',286,'餐饮','wx',d-9],['一场期待已久的电影',49,'娱乐','wx',d-10]].forEach(([n,a,c,ac,day])=>add(date(day),n,a,c,ac));
 add(date(5),'十一月的努力',15000,'工资','daily','income');
 for(let i=1;i<6;i++){let mm=shiftMonth(m,-i);add(mm+'-01','每月的一份安稳',2800,'居住');add(mm+'-10','好好吃饭',1200+i*153,'餐饮','wx');add(mm+'-15','生活里的小喜欢',700+i*123,'购物','ali');add(mm+'-05','每月工资',15000,'工资','daily','income');}
 s.budgets[m]={total:800000,categories:{e0:150000,e1:100000}};return s;
}

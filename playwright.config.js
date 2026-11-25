import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://localhost:4174',viewport:{width:402,height:874},timezoneId:'Asia/Shanghai',launchOptions:{channel:'chrome'}},workers:1});

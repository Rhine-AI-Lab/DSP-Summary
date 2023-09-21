# DSP Summary

### Data & Data service provide - Summary platform

```text
数据及数商信息汇总展示平台
```

## 命令简介

### 1. 快速开始

```text
npm i -g yarn
yarn install
yarn start
```

### 2. Web环境 脚本简介
```text
yarn start : 浏览器开发环境 实时代码更新至页面
yarn build : Web版本打包 用于服务器Web部署
yarn test : 执行单元测试 使用React内置jest包
yarn eject : 单项命令 暴露Webpack配置
```

### 3. Electron环境 脚本简介
```text
yarn dev : 本地开发环境 同时启动start与electron 并实时更新
yarn package : 快速打包至out目录 一般用于调试
yarn make : 完整打包 用于发布 打包架构根据当前pc架构
yarn electron : 仅启动Electron 不启动内部Web端

concurrently "wait-on http://localhost:3000 && electron ." "cross-env BROWSER=none yarn start"
上述为dev命令的最佳实现。使用concurrently库对多命令进行拼接，再由wait-on库等待网页启动完成。
因考虑到需快速启动及显示启动页问题，此项目中省略了wait-on部分，可自行取舍。
```

### 4. 代码规范化 脚本简介
```text
yarn lint : 修复整个项目中可修复的所有Eslint代码规范错误
yarn check : 检查整个项目中的Eslint代码规范
yarn prettier : 通过prettier修复整个项目中可修复的代码规范错误
```

&nbsp;


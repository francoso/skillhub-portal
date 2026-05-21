# 数据源说明

本文档标注 SkillHub Portal 每个数据字段的来源类型，方便后续接通研发数据时对照。

## 数据源类型定义

| 标记 | 含义 | 说明 |
|------|------|------|
| ✅ 自维护 | `manual` | 人工录入JSON，不依赖研发 |
| ⚡ Mock | `mock_beacon` | MVP用固定数据，后续需接Beacon API |
| 🔗 API | `beacon_api` | 已接通Beacon查询API（目标状态） |

## 各模块数据源

### Dashboard 总览

| 字段 | 当前来源 | 目标来源 |
|------|---------|---------|
| Skill总数 | ✅ skills.json 计数 | ✅ 自维护 |
| 贡献者数 | ✅ contributors.json 计数 | ✅ 自维护 |
| 本月调用量 | ⚡ metrics.json mock | 🔗 Beacon API |
| 活跃Skill数 | ⚡ metrics.json mock | 🔗 Beacon API |
| 使用趋势(30天) | ⚡ metrics.json mock | 🔗 Beacon API 时序 |
| 最近动态 | ✅ skills.json + demos.json | ✅ 自维护 |

### Skill目录

| 字段 | 当前来源 | 目标来源 |
|------|---------|---------|
| 名称/描述/owner | ✅ skills.json | ✅ 自维护 |
| 状态 | ✅ skills.json | ✅ 自维护 |
| 分类标签 | ✅ skills.json | ✅ 自维护 |
| 调用量 | ⚡ skills.json mock | 🔗 Beacon API |
| 完成率 | ⚡ skills.json mock | 🔗 Beacon API |
| 评分 | ⚡ skills.json mock | 🔗 评分算法 |

### Demo会管理

| 字段 | 当前来源 | 目标来源 |
|------|---------|---------|
| 全部字段 | ✅ demos.json | ✅ 自维护 |

### 贡献看板

| 字段 | 当前来源 | 目标来源 |
|------|---------|---------|
| 贡献者基本信息 | ✅ contributors.json | ✅ 自维护 |
| 贡献的Skill | ✅ contributors.json | ✅ 自维护 |
| 累计调用量 | ⚡ contributors.json mock | 🔗 Beacon聚合 |
| 贡献分 | ⚡ contributors.json mock | 🔗 评分算法 |

### 机制规则

| 字段 | 当前来源 | 目标来源 |
|------|---------|---------|
| 全部规则 | ✅ rules.json | ✅ 自维护 |

## 研发依赖清单

后续接通时只需修改 `src/lib/data.ts` 的数据加载函数：

1. **Beacon查询API** — 按skill_name+时间范围查询调用量、完成率
2. **用户归属映射** — A2设备指纹→RTX企微账号（MVP阶段用手动录入名字代替）
3. **评分算法** — 基于调用量+完成率+用户反馈的加权评分
4. **埋点模板标准化** — 把datong-report的track.sh抽成标准skill模板

## 数据更新方式

MVP阶段：直接修改 `src/data/*.json` 文件，push到GitHub后Vercel自动重新部署。

后续迭代：
- 短期：添加在线表单提交（替代手改JSON）
- 中期：接通Beacon API，`data.ts`切换到fetch调用
- 长期：RTX打通后贡献看板自动化

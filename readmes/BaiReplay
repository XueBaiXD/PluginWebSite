# BaiReplay

仿 Hypixel 的服务端回放系统。

玩家不需要装任何客户端模组，直接在服务端录制、上传、观看回放。支持跨服部署，一个插件搞定录制、存储、播放三件事。

- 作者：XueBaiXD
- 平台：Paper 1.21.1（其他 1.21.x 应该也能跑，未测试）
- 依赖：PacketEvents 2.7+、MySQL 8、PlaceholderAPI（可选）、SkinsRestorer（可选）

---

## 目录

- [功能](#功能)
- [部署架构](#部署架构)
- [安装](#安装)
- [配置](#配置)
- [命令](#命令)
- [权限](#权限)
- [游戏内使用](#游戏内使用)
- [对接 API](#对接-api)
- [PlaceholderAPI 变量](#placeholderapi-变量)
- [数据库](#数据库)
- [常见问题](#常见问题)
- [兼容性](#兼容性)

---

## 功能

- **自动录制**：游戏开始时自动录制，结束时异步写入数据库，全程不阻塞主线程
- **免模组回放**：观看者只需要 `/replay <房间号>`，不需要装任何客户端模组
- **伪造玩家 NPC**：所有录制的玩家用临时 UUID + 原皮肤重生，不会触发权限组、TAB 头衔、聊天前缀等
- **方块变化还原**：方块的破坏和放置通过数据包还原，不修改真实世界，多个回放可以同时看同一张地图
- **Hypixel 风格交互**：下界之星控制菜单、快捷栏播放控制、书签跳转、进度条、第一人称视角
- **跨服部署**：录制服、大厅服、回放服分工，玩家在大厅点一下就能跳过去看
- **多服务器隔离**：同一个回放服上，不同观看者看不同场次互不干扰，Tab 列表完全独立
- **按权限分级保留**：LuckPerms 权限组决定回放保留时间，普通玩家、VIP、管理组可以设置不同的保留时长，也支持永久
- **到期自动清理**：定时任务扫描数据库，删除过期回放，释放空间
- **占位符支持**：`%bairplay_roomid%` 等变量可以直接用在计分板、TAB、聊天上

---

## 部署架构

有三种运行模式，通过 `config.yml` 的 `server.mode` 切换：

| 模式 | 部署位置 | 干什么的 |
|---|---|---|
| `RECORDER` | 游戏服 | 只录制，玩家看不到回放 |
| `LOBBY` | 大厅服 | 只提供回放列表，点击后跨服到回放服 |
| `REPLAY` | 回放服 | 播放回放，需要把每张地图的世界文件夹放进来 |
| `BOTH` | 单服测试 | 录制 + 回放同服，仅用于本地测试 |

生产环境推荐 **游戏服 + 大厅服 + 回放服** 三端分离：

```text
[游戏服 RECORDER] ──录制──┐
                          ↓
                    [MySQL 数据库]
                          ↓
[大厅服 LOBBY] ──跨服──> [回放服 REPLAY]
```

如果服务器规模不大，也可以只用 `RECORDER` + `REPLAY` 两端，把回放服当大厅用。

---

## 安装

### 1. 环境要求

- Paper 1.21.1
- Java 21
- MySQL 8 或 MariaDB 10.6+
- BungeeCord 或 Waterfall（跨服部署时）

### 2. 数据库准备

先建一个数据库：

```sql
CREATE DATABASE bairplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

插件首次启动会自动建表，不用手动执行 SQL。

### 3. 安装依赖

每个服务端都要装：

- **PacketEvents 2.7+**（必须，回放核心）
- **PlaceholderAPI 2.11+**（可选，想用变量就装）
- **SkinsRestorer**（可选，想要回放里的玩家皮肤和披风）
    - 如果用的是 BungeeCord 架构，BC 端和每个后端 Paper 都要装一份
    - 只在 BC 装的话拿不到完整签名，皮肤会退化显示

### 4. 放插件

把 `BaiReplay-1.0.0-xxxxxx.jar` 丢进服务端的 `plugins/` 目录。

### 5. 回放服放地图

回放服根目录放每张地图的世界文件夹，跟普通世界文件夹一样：

```text
replay-server/
├── world_dust2/
│   ├── level.dat
│   ├── region/
│   └── ...
├── world_military/
│   └── ...
└── plugins/
    └── BaiReplay-1.0.0-xxxxxx.jar
```

然后在 `config.yml` 里登记：

```yaml
replay:
  server-name: "replay-1"    # 回放服在 BungeeCord 里的名字
  maps:
    dust2:
      world: "world_dust2"
      version: 1
    military:
      world: "world_military"
      version: 1
```

`version` 是地图版本号，地图改版后 +1，旧回放会标记为不兼容。

---

## 配置

完整配置见 `config.yml`，下面挑几个重点讲。

### 服务端

```yaml
server:
  mode: REPLAY          # 运行模式
  id: "replay-1"        # 本服实例 ID，跨服时用来定位
```

### 数据库

```yaml
storage:
  database:
    jdbc-url: "jdbc:mysql://127.0.0.1:3306/bairplay?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai"
    username: "root"
    password: "your_password"
    pool-size: 5          # 连接池大小，录制端 3~5 够用
    chunk-size-kb: 1024   # 分块大小，1MB 兼容 MySQL 默认包限制
```

### 保留时间（按权限）

用 LuckPerms 的权限节点决定回放存多久。列表从上到下匹配，第一个命中的生效：

```yaml
storage:
  retention:
    tiers:
      - permission: "bairplay.retention.forever"
        minutes: -1        # 永久
      - permission: "bairplay.retention.staff"
        minutes: 10080     # 7 天
      - permission: "bairplay.retention.vip"
        minutes: 1440      # 1 天
      - permission: "bairplay.retention.default"
        minutes: 30        # 30 分钟
    fallback-minutes: 30   # 都没匹配到时的兜底
```

游戏里给权限：

```text
/lp group vip permission set bairplay.retention.vip true
/lp user XueBaiXD permission set bairplay.retention.forever true
```

一局有多个玩家时，取保留时间最长的那个。5 个普通玩家 + 1 个 VIP，结果按 VIP 的算。

### 录制

```yaml
recording:
  buffer-size-mb: 64              # 内存缓冲区大小
  flush-interval-seconds: 10      # 刷盘间隔
  packet-blacklist:
    - KEEP_ALIVE                  # 不录心跳包
    - PING                        # 不录延迟检测包
```

### 回放

```yaml
replay:
  server-name: "replay-1"          # 回放服在代理里的名字
  default-speed: 1.0               # 默认播放速度
  fast-forward-interval: 5         # 快进间隔（秒）
```

### 清理

```yaml
storage:
  cleanup:
    interval-minutes: 5            # 每 5 分钟扫描一次过期回放
```

---

## 命令

所有命令统一在 `/replay` 下。

| 命令 | 权限 | 说明 |
|---|---|---|
| `/replay` | `bairplay.use` | 打开回放列表 GUI |
| `/replay <房间号>` | `bairplay.use` | 观看指定回放 |
| `/replay stop` | `bairplay.use` | 停止当前正在观看的回放 |
| `/replay help` | `bairplay.use` | 显示帮助 |
| `/replay start <gameId> <mapId> [玩家名...]` | `bairplay.admin` | 手动开始录制 |
| `/replay stoprec <gameId>` | `bairplay.admin` | 手动停止录制 |
| `/replay list` | `bairplay.admin` | 列出当前所有活跃录制 |
| `/replay cleanup` | `bairplay.admin` | 立即清理过期回放 |
| `/replay reload` | `bairplay.admin` | 重载配置文件 |

房间号是 6 位小写字母 + 数字，比如 `a3k9z7`。输入时大小写不敏感。

---

## 权限

| 权限节点 | 默认 | 说明 |
|---|---|---|
| `bairplay.use` | true | 使用 `/replay` |
| `bairplay.admin` | op | 管理命令 |
| `bairplay.retention.default` | - | 普通玩家保留策略（自定） |
| `bairplay.retention.vip` | - | VIP 保留策略（自定） |
| `bairplay.retention.staff` | - | 管理组保留策略（自定） |
| `bairplay.retention.forever` | - | 永久保留（自定） |

保留权限的具体名字不固定，你在 `config.yml` 里爱写啥写啥，只要 LuckPerms 里加对应的就行。

---

## 游戏内使用

### 录制方

游戏开始时让游戏模式插件调用 API 开启录制：

```java
BaiReplayPlugin bai = BaiReplayPlugin.getInstance();
if (bai != null && bai.getApi() != null) {
String gameId = UUID.randomUUID().toString().replace("-", "");
Collection<UUID> players = game.getPlayers().stream()
        .map(Player::getUniqueId)
        .toList();

String roomId = bai.getApi().startRecording(gameId, "dust2", players);
// roomId 是 6 位房间号，可以用计分板显示
}
```

游戏结束时停止：

```java
bai.getApi().stopRecording(gameId);
```

如果游戏里有关键事件（击杀、撤离、开箱），记录书签：

```java
bai.getApi().recordEvent(gameId, killer.getUniqueId(),
GameEventType.PLAYER_KILL, "击杀 " + victim.getName());

        bai.getApi().recordEvent(gameId, player.getUniqueId(),
GameEventType.EXTRACT, "撤离点 A");
```

### 观看方

玩家在游戏里执行 `/replay a3k9z7` 就能看。

进入回放后会自动：

- 切旁观模式
- 快捷栏给 7 个控制物品
- 显示进度条

**快捷栏布局**（跟 Hypixel 一样）：

| 槽位 | 物品 | 功能 |
|---|---|---|
| 1 | 指南针 | 传送到指定玩家 |
| 2 | 时钟 | 减速（最低 0.25x） |
| 3 | 空 | - |
| 4 | 箭 | 倒退 5 秒 |
| 5 | 书 | 暂停 / 继续 |
| 6 | 箭 | 前进 5 秒 |
| 7 | 空 | - |
| 8 | 时钟 | 加速（最高 4x） |
| 9 | 下界之星 | 打开回放菜单 |

**回放菜单**（右键下界之星）：

- **设置**：聊天消息开关、播放速度、快进间隔
- **书签**：按事件跳转（击杀、撤离、爆炸等）
- **分享**：复制房间号
- **提交高光**：暂未接入
- **离开回放**：退出

还有**第一人称视角**：指南针选某个玩家后可以进入他的第一人称视角。

**其他操作**：

- 进度显示在 ActionBar（屏幕下方）
- 观看者之间完全隔离，Tab、实体、头顶显示互相看不见
- 退出回放时原位置、物品栏、经验值全部恢复

---

## 对接 API

BaiReplay 提供了公开 API，任何插件都可以调用。

### 1. 添加依赖

先在 BaiReplay 项目根目录执行一次 `mvn install`，把它装进本地 Maven 仓库。

然后你的插件 `pom.xml`：

```xml
<dependency>
    <groupId>com.xuebaixd</groupId>
    <artifactId>BaiReplay</artifactId>
    <version>1.0.0</version>
    <scope>provided</scope>
</dependency>
```

`plugin.yml` 加软依赖：

```yaml
softdepend:
  - BaiReplay
```

用 `softdepend` 而不是 `depend`，这样 BaiReplay 没装的时候你的插件也能正常启动，只是没有回放功能。

### 2. 获取 API 实例

```java
import com.xuebaixd.bairplay.BaiReplayPlugin;
import com.xuebaixd.bairplay.api.BaiReplayAPI;

BaiReplayPlugin bai = BaiReplayPlugin.getInstance();
if (bai == null || bai.getApi() == null) {
getLogger().warning("BaiReplay 未安装，回放功能已禁用");
    return;
            }
BaiReplayAPI api = bai.getApi();
```

建议懒加载，在用到的时候再取，避免插件加载顺序问题。

### 3. API 方法列表

#### `startRecording(String gameId, String mapId, Collection<UUID> players)`

开始录制一局，返回 6 位房间号。

参数：

- `gameId`：全局唯一 ID，建议用 `UUID.randomUUID().toString().replace("-", "")`
- `mapId`：地图 ID，必须在 `config.yml` 的 `replay.maps` 里登记过
- `players`：参与玩家的 UUID 集合

```java
String roomId = api.startRecording(gameId, "dust2", playerUuids);
```

#### `stopRecording(String gameId)`

停止录制，异步序列化并入库。返回是否成功。

```java
api.stopRecording(gameId);
```

#### `recordEvent(String gameId, UUID player, GameEventType type, String data)`

记录一个事件，用于回放书签。

事件类型：

| 类型 | 说明 |
|---|---|
| `PLAYER_DEATH` | 玩家死亡 |
| `PLAYER_KILL` | 玩家击杀 |
| `BED_DESTROYED` | 床被破坏 |
| `ITEM_PICKUP` | 拾取重要物品 |
| `EXPLOSION` | 爆炸 |
| `CUSTOM` | 自定义事件 |

`player` 可以为 null（表示系统事件），`data` 是自由文本，会显示在书签 Lore 上。

```java
api.recordEvent(gameId, player.getUniqueId(),
GameEventType.PLAYER_KILL, "击杀 " + victim.getName());
```

#### `getRoomId(Player player)`

返回玩家当前所在房间号。不在游戏中返回 `Optional.empty()`。

```java
Optional<String> roomId = api.getRoomId(player);
```

#### `getGameId(Player player)`

返回玩家当前所在 gameId。

#### `getStatus(Player player)`

返回玩家状态字符串：`"playing"` / `"replay"` / `"none"`。

#### `listActiveRecordings()`

返回所有活跃录制的 Map，key 是 gameId，value 是房间号。

```java
Map<String, String> active = api.listActiveRecordings();
for (Map.Entry<String, String> e : active.entrySet()) {
getLogger().info("正在录制: " + e.getKey() + " 房间号 " + e.getValue());
        }
```

#### `getActivePlayers(String gameId)`

返回指定录制中的玩家名列表。

#### `runCleanupNow()`

手动触发一次过期清理，异步执行。

---

## PlaceholderAPI 变量

装 PlaceholderAPI 的话，可以用这些变量：

| 变量 | 说明 | 无值时 |
|---|---|---|
| `%bairplay_roomid%` | 当前房间号 | `------` |
| `%bairplay_gameid%` | 完整 gameId | 空字符串 |
| `%bairplay_status%` | playing / replay / none | `none` |
| `%bairplay_players%` | 当前房间玩家数 | `0` |

计分板里可以直接用：

```yaml
lines:
  - "&7房间: &f%bairplay_roomid%"
```

不生效的话执行一次 `/papi reload`。

---

## 数据库

插件会自动创建三张表：

### `bairplay_replay`

回放元数据。每条记录对应一局回放。

关键字段：

| 字段 | 说明 |
|---|---|
| `game_id` | 主键，UUID 去连字符 |
| `room_id` | 6 位房间号，唯一 |
| `map_id` / `map_version` | 地图 |
| `server_id` | 录制所在的服务器 |
| `start_time` / `end_time` / `duration_ms` | 时间信息 |
| `player_count` / `players_json` | 玩家信息 |
| `format_version` | 回放格式版本 |
| `size_bytes` / `checksum` | 数据大小、校验 |
| `expires_at` | 到期时间戳，`Long.MAX_VALUE` 表示永久 |

### `bairplay_replay_chunk`

回放二进制分块。每个回放按 1MB 切块存储，LZ4 压缩。

外键关联 `bairplay_replay`，删除元数据时级联删块。

### `bairplay_return_location`

玩家进入回放前的位置，退出时用来恢复。跨服观看场景下用。过期时间 1 小时。

---

## 常见问题

**Q: 回放里看不到玩家？**

A: 检查 PacketEvents 版本是不是 2.7+，控制台有没有 `[回放] 已生成 N 个 NPC` 的日志。N 是 0 说明录制数据里就没玩家。

**Q: 回放里玩家皮肤是 2D 的，没披风？**

A: SkinsRestorer 只在 BC 端装了。要在 **每个后端 Paper 服务端** 也装一份 SkinsRestorer，进入桥接模式，这样后端插件才能拿到完整皮肤签名。

**Q: 录制数据存哪？**

A: 全部在 MySQL 里，没有本地文件。备份的话备份数据库就行。

**Q: 房间号会不会重复？**

A: 6 位小写字母 + 数字，36^6 约 21.7 亿种组合。生成时查数据库唯一性，冲突就重试。实际使用中几乎不可能重复。

**Q: 回放服需要给玩家开放什么权限？**

A: `bairplay.use` 就够了。玩家进回放服后会自动切模式、发物品、隔离 Tab，不需要额外权限。

**Q: 怎么修改回放保留时间？**

A: 改 `config.yml` 的 `storage.retention.tiers`，或者直接在 LuckPerms 里调整玩家的权限组。

**Q: 提示"回放格式版本不匹配"？**

A: 插件更新导致格式版本升级了，旧回放不兼容。清空数据库重新录制：

```sql
DELETE FROM bairplay_replay_chunk;
DELETE FROM bairplay_replay;
```

**Q: 回放服的地图改版了，旧回放还能看吗？**

A: 能看，但可能错位。建议改版时把 `map_version` +1，旧回放会被标记为不兼容。

**Q: 玩家在回放里能破坏方块吗？**

A: 不能。回放里的所有方块的破坏和放置都是通过数据包伪造的，观看者处于 ADVENTURE 模式，只能看，不能交互。

**Q: 多个玩家同时看同一个回放会互相干扰吗？**

A: 不会。每个观看者是独立的会话，各自维护自己的时间轴、伪造 NPC、方块变化。回放服上不同观看者之间是完全隔离的。

**Q: 支持 Velocity 吗？**

A: 当前版本只支持 BungeeCord / Waterfall 的跨服消息通道。Velocity 没测试过，理论上也能跑，但不保证。

**Q: 玩家的物品栏会被回放系统覆盖吗？**

A: 不会。进入回放前会保存玩家的物品栏、经验值、原位置、游戏模式，退出时全部恢复。回放里发的下界之星等物品不会带出去。

---

## 兼容性

- **Paper 1.21.1**（其他 1.21.x 应该也能跑，未测试）
- **Java 21**
- **MySQL 8 / MariaDB 10.6+**
- **BungeeCord / Waterfall** 跨服
- **LuckPerms** 权限组
- **PacketEvents 2.7+**
- **PlaceholderAPI 2.11+**（可选）
- **SkinsRestorer**（可选，BC 端 + 每个后端都要装）

---

## 版本历史

### 1.0.0

- 首个正式版本
- 完整的录制、存储、回放流程
- Hypixel 风格交互
- 跨服部署支持
- 权限分级保留
- PlaceholderAPI 变量

---

## 反馈

有 bug 或者建议，欢迎反馈。

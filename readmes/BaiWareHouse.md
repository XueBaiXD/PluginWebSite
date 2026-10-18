# BaiWarehouse

一个为 Minecraft 1.21.11 设计的 RPG 服仓库插件，支持 MySQL / SQLite / JSON 三种存储、跨服同步、高度自定义 GUI 与独立 API。

- 版本：1.0.3
- 作者：XueBaiXD
- MC 版本：1.21.11（Paper/Spigot）
- 软依赖：PlaceholderAPI
- Java：21

## 功能特性

- 个人仓库：每玩家独立仓库，格数可配置
- 跨服同步：MySQL 存储时所有子服共享数据
- GUI：箱子样式，自动分页
- 存取：左键存取、Shift+左键整组、右键单件
- 模糊搜索：支持中英文物品名
- 一键整理：堆叠同类并排序
- 词条判定：含 `&c禁止存储` 的物品禁止存入（可配置）
- 界面自定义：`page/*.yml` 自定义布局与按钮
- 三种存储：MySQL / SQLite / JSON 文件
- 消息可配置：`message.yml`，支持 `{prefix}`
- 权限系统：普通玩家与管理员分离
- API 接口：提供独立 API JAR

## 安装

1. 将 `BaiWarehouse-1.0.3.jar` 放入 `plugins/`
2. 启动服务器生成配置
3. 编辑 `config.yml`、`message.yml`、`page/`
4. 重载：`/bwh reload`

## 命令与权限

| 命令 | 说明 | 权限 |
|------|------|------|
| /bwh open <仓库名> [页码] | 打开仓库 | baiwarehouse.use |
| /bwh search <关键词> | 搜索物品 | baiwarehouse.search |
| /bwh sort | 整理仓库 | baiwarehouse.sort |
| /bwh reload | 重载配置 | baiwarehouse.admin |
| /bwh info | 查看插件信息 | baiwarehouse.admin |
| /bwh help | 显示帮助 | - |

权限节点默认值：`baiwarehouse.use/search/sort` 所有玩家，`baiwarehouse.admin` 仅 OP。普通玩家 `/bwh help` 只显示基础命令，管理员显示全部。

## 配置文件

### config.yml

    storage-type: file        # mysql / sqlite / file
    mysql:
      host: localhost
      port: 3306
      database: minecraft
      username: root
      password: ''
    sqlite:
      file: warehouse.db
    file:
      data-folder: data
    forbidden-lore: "&c禁止存储"
    auto-save-interval: 300
    economy-enabled: false

### message.yml

    prefix: "&6[&b仓库&6]&r"
    help-user:
      - "&7===== &6BaiWarehouse 帮助 &7====="
      - "&b/bwh open <仓库名> [页码] &7- 打开仓库"
      - "&b/bwh search <关键词> &7- 搜索物品"
      - "&b/bwh sort &7- 整理仓库"
      - "&b/bwh help &7- 显示帮助"
    help-admin:
      - "&7===== &6BaiWarehouse 帮助 &7====="
      - "&b/bwh open <仓库名> [页码] &7- 打开仓库"
      - "&b/bwh search <关键词> &7- 搜索物品"
      - "&b/bwh sort &7- 整理仓库"
      - "&b/bwh reload &7- 重载配置文件"
      - "&b/bwh info &7- 查看插件信息"
      - "&b/bwh help &7- 显示帮助"
    no-permission: "{prefix} &c你没有权限执行此操作！"
    player-only: "{prefix} &c该命令只能由玩家执行！"
    unknown-command: "{prefix} &c未知命令，输入 /bwh help 查看帮助。"
    warehouse-not-found: "{prefix} &c未找到名为 &6{name} &c的仓库配置！"
    page-not-found: "{prefix} &c页码超出范围！"
    opened-warehouse: "{prefix} &a已打开仓库 &6{name} &a第 &6{page} &a页"
    search-result: "{prefix} &a找到 &6{count} &a个匹配物品"
    search-none: "{prefix} &c未找到匹配物品"
    sorted: "{prefix} &a整理完成！"
    reloaded: "{prefix} &a配置已重载！"
    forbidden-item: "{prefix} &c该物品包含禁止存储的标识，无法存入！"
    item-locked: "{prefix} &c该格子已被锁定！"
    saved: "{prefix} &a数据已保存！"
    info:
      - "&6===== BaiWarehouse 信息 ====="
      - "&b版本: &f{version}"
      - "&b作者: &f{authors}"
      - "&b存储类型: &f{storage}"
      - "&b状态: &f{status}"
      - "&6============================"

### page/默认仓库.yml

    name: "&6默认仓库"
    layout:
      - '####4####'
      - '+++++++++'
      - '+++++++++'
      - '+++++++++'
      - '+++++++++'
      - '+++++++++'
      - '1###3###2'
    buttons:
      1:
        material: ARROW
        name: '&a上一页'
        lore:
          - '&7点击回到上一页'
          - '&7当前页: {page}'
        action: 'command: bwh open {warehouse} {page-1}'
      2:
        material: ARROW
        name: '&a下一页'
        lore:
          - '&7点击到下一页'
          - '&7当前页: {page}'
        action: 'command: bwh open {warehouse} {page+1}'
      3:
        material: BOOK
        name: '&e仓库信息'
        lore:
          - '&7仓库: {warehouse}'
          - '&7当前页: {page}'
          - '&7总页数: {total-pages}'
        action: 'none'
      4:
        material: BARRIER
        name: '&c锁定'
        lore:
          - '&7点击锁定/解锁'
          - '&7当前状态: {lock-status}'
        action: 'toggle-lock'

布局符号：# 装饰格，+ 仓库格，数字为按钮编号。

占位符：`{warehouse}` 仓库名，`{page}` 当前页，`{page-1}` 上一页，`{page+1}` 下一页，`{total-pages}` 总页数，`{lock-status}` 锁定状态。

按钮动作：`command: <命令>` 执行命令，`toggle-lock` 切换锁定，`none` 无动作。

## API 对接

BaiWarehouse 提供独立 API JAR（`BaiWarehouse-1.0.3-API.jar`）。

Maven 引入：

    <dependency>
        <groupId>com.xuebai</groupId>
        <artifactId>BaiWarehouse</artifactId>
        <version>1.0.3</version>
        <classifier>api</classifier>
        <scope>provided</scope>
    </dependency>

Gradle 引入：

    compileOnly 'com.xuebai:BaiWarehouse:1.0.3:api'

可用方法：

    import com.xuebai.baiwarehouse.api.BaiWarehouseAPI;
    import com.xuebai.baiwarehouse.data.WarehouseData;
    import org.bukkit.inventory.ItemStack;
    import java.util.List;
    import java.util.UUID;

    // 获取玩家仓库所有物品
    List<ItemStack> items = BaiWarehouseAPI.getPlayerItems(uuid);

    // 获取玩家仓库数据对象
    WarehouseData data = BaiWarehouseAPI.getWarehouseData(uuid);
    List<ItemStack> itemsFromData = data.getItems();

    // 保存玩家数据（异步）
    BaiWarehouseAPI.savePlayerData(uuid);

注意事项：

- 返回的 ItemStack 列表为快照，修改后需调用 savePlayerData 保存
- 调用前确保 BaiWarehouse 已加载
- 在 plugin.yml 中添加 `depend` 或 `softdepend: [BaiWarehouse]`

## 构建

需要 Java 21，执行：

    mvn clean package

生成文件：

| 文件 | 说明 |
|------|------|
| BaiWarehouse-1.0.3.jar | 完整插件（含依赖，用于部署） |
| BaiWarehouse-1.0.3-API.jar | 纯 API 包（供其他插件引用） |

主插件 JAR 约 17 MB，因打包了 SQLite 驱动等依赖，属于正常。

## 常见问题

Q：仓库数据保存在哪里？
A：取决于 storage-type。file 模式在 `plugins/BaiWarehouse/data/` 下 JSON 文件；sqlite 在 `warehouse.db`；mysql 在数据库中。

Q：如何跨服同步？
A：storage-type 设为 mysql，各子服配置相同数据库。

Q：如何添加新仓库类型？
A：在 `plugins/BaiWarehouse/page/` 新建 `.yml`，通过 `/bwh open <文件名> [页码]` 打开。

Q：如何自定义按钮动作？
A：action 支持 `command: <命令>`、`toggle-lock`、`none`，命令中可用占位符。

Q：主插件 JAR 为什么这么大？
A：打包了 SQLite 驱动（约 13 MB），不使用 SQLite 可移除依赖减小体积。

Q：如何让 info 只有管理员能用？
A：info 和 reload 已默认要求 `baiwarehouse.admin` 权限（即 OP）。


## 许可

本插件为原创作品，保留所有权利。未经作者许可，禁止二次分发或用于商业用途。
/**
 * 文件监听脚本 - 监听文件保存事件并执行同步到远程仓库
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const chokidar = require('chokidar');

// 监听的目录列表
const WATCH_DIRS = [
  'views',
  'pages',
  'scripts',
  'styles',
  'layouts',
  'apis',
  'codeBlocks'
];

// 同步脚本路径
const SYNC_SCRIPT_PATH = path.join(__dirname, 'sync-to-remote.js');

// 防抖函数，避免频繁触发同步
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// 记录变化的文件
let changedFiles = new Map(); // 文件路径 -> 文件类型

// 获取文件类型
function getFileType(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  // 使用 path.sep 来获取当前系统的路径分隔符
  const dirName = relativePath.split(path.sep)[0];

  // 文件类型映射
  const FILE_TYPE_MAP = {
    'views': 'view',
    'pages': 'page',
    'scripts': 'script',
    'styles': 'style',
    'layouts': 'layout',
    'codeBlocks': 'codeblock',
    'apis': 'api'
  };

  return FILE_TYPE_MAP[dirName] || 'unknown';
}

// 生成URL路径
function generateUrl(filePath, fileType) {
  const relativePath = path.relative(process.cwd(), filePath);

  if (fileType === 'page') {
    // 从文件路径中提取页面名称
    const pageName = path.basename(filePath, path.extname(filePath));
    // 如果是home页面，返回根路径，否则返回页面名称作为路径
    if (pageName === 'page.home') {
      return '/';
    } else {
      // 移除"page."前缀
      const routeName = pageName.replace(/^page\./, '');
      return `/${routeName}`;
    }
  } else if (fileType === 'api') {
    // 从文件路径中提取API名称
    const apiName = path.basename(filePath, path.extname(filePath));
    // 移除"api_"前缀
    const routeName = apiName.replace(/^api_/, '');
    if (apiName.startsWith('__')) {
      return `/${routeName}`;
    }
    return `/api/${routeName}/{action}`;
  }
  return null;
}

// 处理文件名
function handleFileName(filePath, fileType) {
  if (['style', 'script'].includes(fileType.toLowerCase())) {
    return path.basename(filePath);
  }
  // 返回文件的名称
  return path.basename(filePath, path.extname(filePath));
}

// 直接同步单个文件
function syncSingleFile(filePath) {
  const fileType = getFileType(filePath);
  if (fileType === 'unknown') {
    console.log(`无法确定文件类型: ${filePath}`);
    return;
  }

  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`准备同步文件: ${relativePath}`);

  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf-8');

    // 准备文件数据
    const fileName = handleFileName(filePath, fileType);
    const url = generateUrl(filePath, fileType);

    // 构建单个文件的同步数据
    const fileData = {
      type: fileType,
      resource: {
        name: fileName,
        body: content
      }
    };

    // 添加特定类型的属性
    if (fileType === 'codeblock') {
      fileData.resource.codeType = 'CodeBlock';
    }
    if (fileType === 'api') {
      fileData.resource.codeType = 'Api';
      fileData.resource.scriptType = 1;
    }

    // 如果有URL，添加到数据中
    if (url) {
      fileData.resource.url = url;
    }

    // 将数据写入临时JSON文件
    const tempJsonPath = path.join(__dirname, 'temp-sync-file.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify({ codeArr: [fileData] }, null, 2));

    // 执行同步命令
    const syncCmd = `node ${SYNC_SCRIPT_PATH} --file ${tempJsonPath}`;
    console.log(`执行命令: ${syncCmd}`);

    exec(syncCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行同步脚本时出错: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`同步脚本错误输出: ${stderr}`);
      }
      console.log(`同步脚本输出:\n${stdout}`);

      // 同步完成后删除临时文件
      try {
        fs.unlinkSync(tempJsonPath);
      } catch (e) {
        console.error(`删除临时文件失败: ${e.message}`);
      }
    });
  } catch (error) {
    console.error(`处理文件时出错: ${error.message}`);
  }
}

// 批量同步多个文件
function syncMultipleFiles(files) {
  console.log(`准备同步 ${files.size} 个文件`);

  try {
    // 构建文件数据数组
    const codeArr = [];

    for (const [filePath, fileType] of files.entries()) {
      try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf-8');

        // 准备文件数据
        const fileName = handleFileName(filePath, fileType);
        const url = generateUrl(filePath, fileType);
        const relativePath = path.relative(process.cwd(), filePath);

        // 构建文件数据
        const fileData = {
          type: fileType,
          resource: {
            name: fileName,
            body: content
          }
        };

        // 添加特定类型的属性
        if (fileType === 'codeblock') {
          fileData.resource.codeType = 'CodeBlock';
        }
        if (fileType === 'api') {
          fileData.resource.codeType = 'Api';
          fileData.resource.scriptType = 1;
        }

        // 如果有URL，添加到数据中
        if (url) {
          fileData.resource.url = url;
        }

        codeArr.push(fileData);
        console.log(`已添加文件: ${relativePath}`);
      } catch (error) {
        console.error(`处理文件 ${filePath} 时出错: ${error.message}`);
      }
    }

    if (codeArr.length === 0) {
      console.log('没有有效的文件需要同步');
      return;
    }

    // 将数据写入临时JSON文件
    const tempJsonPath = path.join(__dirname, 'temp-sync-files.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify({ codeArr }, null, 2));

    // 执行同步命令
    const syncCmd = `node ${SYNC_SCRIPT_PATH} --file ${tempJsonPath}`;
    console.log(`执行命令: ${syncCmd}`);

    exec(syncCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行同步脚本时出错: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`同步脚本错误输出: ${stderr}`);
      }
      console.log(`同步脚本输出:\n${stdout}`);

      // 同步完成后删除临时文件
      try {
        fs.unlinkSync(tempJsonPath);
      } catch (e) {
        console.error(`删除临时文件失败: ${e.message}`);
      }
    });
  } catch (error) {
    console.error(`批量同步文件时出错: ${error.message}`);
  }
}

// 执行同步的函数
function runSync() {
  if (changedFiles.size === 1) {
    // 只有一个文件变化，直接同步单个文件
    const [[filePath, _]] = changedFiles.entries();
    syncSingleFile(filePath);
  } else if (changedFiles.size > 1) {
    // 多个文件变化，批量同步
    syncMultipleFiles(changedFiles);
  }

  // 清空变化文件记录
  changedFiles.clear();
}

// 使用防抖处理同步，避免短时间内多次触发
const debouncedSync = debounce(runSync, 10);

// 启动文件监听
function startWatching() {
  console.log('开始监听文件变化...');

  // 创建监听器，监听所有指定目录
  const watchPaths = WATCH_DIRS.map(dir => path.join(process.cwd(), dir));

  // 初始化 chokidar 监听器
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // 忽略点文件
    persistent: true,
    ignoreInitial: true
  });

  // 监听所有文件变化事件
  watcher.on('all', (event, filePath) => {
    if (['add', 'change'].includes(event)) {
      // 提取目录名
      const relativePath = path.relative(process.cwd(), filePath);
      const dirName = relativePath.split(path.sep)[0];

      if (WATCH_DIRS.includes(dirName)) {
        console.log(`检测到 ${event} 事件: ${relativePath}`);

        // 获取文件类型
        const fileType = getFileType(filePath);

        // 记录变化的文件
        changedFiles.set(filePath, fileType);

        // 触发防抖同步
        debouncedSync();
      }
    } else if (event === 'unlink') {
      // 文件被删除，从变化记录中移除
      changedFiles.delete(filePath);
    }
  });

  console.log(`正在监听以下目录: ${WATCH_DIRS.join(', ')}`);
  console.log('文件监听已启动，保存文件后将自动同步到远程仓库');
}

// 检查是否安装了 chokidar
try {
  require.resolve('chokidar');
  // 启动监听
  startWatching();
} catch (e) {
  console.error('缺少必要的依赖: chokidar');
  console.log('请先安装依赖: npm install chokidar');
  process.exit(1);
} 
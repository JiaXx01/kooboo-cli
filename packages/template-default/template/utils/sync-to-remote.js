/**
 * 同步文件到远程 kooboo 仓库的工具
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dayjs = require('dayjs');

// 本地文件夹
const LOCAL_DIR = path.resolve(process.cwd());

// .kbignore 文件路径
const KBIGNORE_PATH = path.join(LOCAL_DIR, 'utils', '.kbignore');

// 远程仓库地址
const REMOTE_REPO_URL = 'your remote repo url';
const IMPORT_API_URL = `${REMOTE_REPO_URL}/_site_import_helper/api/__import`;

// 文件类型映射
const FILE_TYPE_MAP = {
  views: 'view',
  pages: 'page',
  scripts: 'script',
  styles: 'style',
  layouts: 'layout',
  codeBlocks: 'codeblock',
  apis: 'api'
};

/**
 * 读取 .kbignore 文件内容
 * @returns {Array} 忽略文件列表
 */
function readKbIgnoreFile() {
  try {
    if (fs.existsSync(KBIGNORE_PATH)) {
      const content = fs.readFileSync(KBIGNORE_PATH, 'utf8');
      // 按行分割，过滤空行和注释行，并去除每行的空白字符
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    }
  } catch (error) {
    console.error('读取 .kbignore 文件失败:', error);
  }
  return [];
}

/**
 * 检查文件是否应该被忽略
 * @param {string} fileName - 文件名
 * @param {Array} ignoreFiles - 忽略文件列表
 * @returns {boolean} 是否应该忽略
 */
function shouldIgnoreFile(fileName, ignoreFiles) {
  return ignoreFiles.some(pattern => {
    // 简单的文件名匹配，可以根据需要扩展为通配符匹配
    return fileName === pattern;
  });
}

// 生成URL路径
function generateUrl(filePath, fileType) {
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

// 读取目录下的所有文件
async function readFilesFromDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // 如果是目录，递归读取
    if (stat.isDirectory()) {
      const subFiles = await readFilesFromDir(fullPath);
      files.push(...subFiles);
    } else {
      // 读取文件内容
      const content = fs.readFileSync(fullPath, 'utf-8');
      // 提取文件类型
      const relativePath = path.relative(LOCAL_DIR, fullPath);
      // 使用 path.sep 来获取当前系统的路径分隔符
      const dirName = relativePath.split(path.sep)[0];
      const fileType = FILE_TYPE_MAP[dirName] || 'unknown';

      files.push({
        path: relativePath,
        content,
        type: fileType,
        url: generateUrl(relativePath, fileType)
      });
    }
  }

  return files;
}

function handleFileName(file) {
  const { type } = file;
  if (['style', 'script'].includes(type.toLowerCase())) {
    return path.basename(file.path)
  }
  // 返回文件的名称
  return path.basename(file.path, path.extname(file.path))
}

// 将文件同步到远程仓库
async function syncToRemote(specificDirs = null) {
  try {
    console.log('开始读取文件...');

    // 读取忽略文件列表
    const ignoreFiles = readKbIgnoreFile();
    if (ignoreFiles.length > 0) {
      console.log(`将忽略以下文件: ${ignoreFiles.join(', ')}`);
    }

    // 确定要同步的目录
    let dirsToSync;
    if (specificDirs && Array.isArray(specificDirs) && specificDirs.length > 0) {
      dirsToSync = specificDirs;
      console.log(`将只同步以下目录: ${dirsToSync.join(', ')}`);
    } else {
      dirsToSync = ['views', 'pages', 'scripts', 'styles', 'layouts', 'apis', 'codeBlocks'];
      console.log('将同步所有目录');
    }

    // 读取指定目录下的文件
    const allFiles = [];
    const ignoredFiles = [];

    for (const dir of dirsToSync) {
      const dirPath = path.join(LOCAL_DIR, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`读取 ${dir} 目录...`);
        const files = await readFilesFromDir(dirPath);

        // 过滤掉被忽略的文件
        const filteredFiles = files.filter(file => {
          const fileName = path.basename(file.path);
          const shouldIgnore = shouldIgnoreFile(fileName, ignoreFiles);
          if (shouldIgnore) {
            ignoredFiles.push(file.path);
          }
          return !shouldIgnore;
        });

        allFiles.push(...filteredFiles);
        console.log(`${dir} 目录下找到 ${files.length} 个文件，忽略 ${files.length - filteredFiles.length} 个文件`);
      } else {
        console.log(`警告: ${dir} 目录不存在，已跳过`);
      }
    }

    if (ignoredFiles.length > 0) {
      console.log(`总共忽略了 ${ignoredFiles.length} 个文件`);
    }

    // 准备请求数据
    const codeArr = allFiles.map(file => {
      const fileData = {
        type: file.type,
        resource: {
          name: handleFileName(file),
          body: file.content,
        }
      };
      if (file.type === 'codeblock') {
        fileData.resource.codeType = 'CodeBlock'
      }
      if (file.type === 'api') {
        fileData.resource.codeType = 'Api'
        fileData.resource.scriptType = 1
      }
      // 如果有URL，添加到数据中
      if (file.url) {
        fileData.resource.url = file.url;
      }

      return fileData;
    });

    console.log(`准备同步 ${codeArr.length} 个文件到远程仓库...`);

    // 确保存储目录存在
    const syncJsonDir = path.join(LOCAL_DIR, '/utils/sync-json');
    if (!fs.existsSync(syncJsonDir)) {
      fs.mkdirSync(syncJsonDir, { recursive: true });
    }

    // 存储 codeArr 到本地文件夹
    const timestamp = dayjs().format('YYYY-MM-DD--HHmm');
    const jsonFilePath = path.join(syncJsonDir, `codeArr-${timestamp}.json`);

    // 构建日志内容，包含忽略的文件信息
    const logData = {
      timestamp,
      totalFiles: allFiles.length,
      ignoredFiles: ignoredFiles,
      ignorePatterns: ignoreFiles,
      codeArr
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(logData, null, 2));
    console.log(`已将同步数据保存到: ${jsonFilePath}`);

    // 发送请求
    console.log('正在发送同步请求...');
    const response = await axios.post(IMPORT_API_URL, { codeArr });

    if (response.status === 200) {
      console.log('同步成功！');
      console.log(response.data);
    } else {
      console.error('同步失败！');
      console.error(response.data);
    }
  } catch (error) {
    console.error('同步过程中发生错误：', error);
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return { dirs: null, file: null }; // 没有指定目录或文件，同步所有
  }

  const result = { dirs: null, file: null };

  // 检查是否有 --dirs 参数
  const dirsIndex = args.indexOf('--dirs');
  if (dirsIndex !== -1 && dirsIndex < args.length - 1) {
    // 获取目录列表
    const dirsList = args[dirsIndex + 1].split(',').map(dir => dir.trim());
    result.dirs = dirsList;
  }

  // 检查是否有 --file 参数
  const fileIndex = args.indexOf('--file');
  if (fileIndex !== -1 && fileIndex < args.length - 1) {
    // 获取文件路径
    result.file = args[fileIndex + 1];
  }

  return result;
}

// 从文件读取同步数据
async function syncFromFile(filePath) {
  try {
    console.log(`从文件读取同步数据: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      return;
    }

    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let syncData;

    try {
      syncData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`解析JSON文件失败: ${error.message}`);
      return;
    }

    if (!syncData.codeArr || !Array.isArray(syncData.codeArr)) {
      console.error('文件格式不正确，缺少 codeArr 数组');
      return;
    }

    const codeArr = syncData.codeArr;
    console.log(`准备同步 ${codeArr.length} 个文件到远程仓库...`);

    // 确保存储目录存在
    const syncJsonDir = path.join(LOCAL_DIR, '/utils/sync-json');
    if (!fs.existsSync(syncJsonDir)) {
      fs.mkdirSync(syncJsonDir, { recursive: true });
    }
    // 单文件不记录日志
    if (process.argv.indexOf('--file') !== -1) {
      // 存储 codeArr 到本地文件夹
      const timestamp = dayjs().format('YYYY-MM-DD--HHmm');
      const jsonFilePath = path.join(syncJsonDir, `codeArr-${timestamp}.json`);

      // 构建日志内容
      const logData = {
        timestamp,
        totalFiles: codeArr.length,
        source: filePath,
        codeArr
      };

      fs.writeFileSync(jsonFilePath, JSON.stringify(logData, null, 2));
      console.log(`已将同步数据保存到: ${jsonFilePath}`);
    }

    // 发送请求
    console.log('正在发送同步请求...');
    const response = await axios.post(IMPORT_API_URL, { codeArr });

    if (response.status === 200) {
      console.log('同步成功！');
      console.log(response.data);
    } else {
      console.error('同步失败！');
      console.error(response.data);
    }
  } catch (error) {
    console.error('从文件同步过程中发生错误：', error);
  }
}

// 主函数
function main() {
  const args = parseArgs();

  if (args.file) {
    // 从文件读取同步数据
    syncFromFile(args.file);
  } else {
    // 从目录读取文件并同步
    syncToRemote(args.dirs);
  }
}

// 执行主函数
main(); 
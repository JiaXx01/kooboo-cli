/**
 * 从远程 kooboo 仓库拉取资源到本地的工具
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dayjs = require('dayjs');

// 本地文件夹
const LOCAL_DIR = path.resolve(process.cwd());

// 日志文件夹
const PULL_JSON_DIR = path.join(LOCAL_DIR, 'utils', 'pull-json');

// 远程仓库地址
const REMOTE_REPO_URL = 'your remote repo url';
const EXPORT_API_URL = `${REMOTE_REPO_URL}/_site_import_helper/api/__export`;

// .kbignore 文件路径
const KBIGNORE_PATH = path.join(LOCAL_DIR, 'utils', '.kbignore');

// 文件类型映射
const FILE_TYPE_MAP = {
  view: 'views',
  page: 'pages',
  script: 'scripts',
  style: 'styles',
  layout: 'layouts',
  code: 'codeBlocks', // 包括 API 和 CodeBlock
  api: 'apis',
  codeblock: 'codeBlocks',
};

// 代码类型映射
const CODE_TYPE_MAP = {
  'Api': 'apis',
  'CodeBlock': 'codeBlocks'
};

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 将资源保存到本地文件
 * @param {Object} resource - 资源对象
 */
function saveResourceToFile(resource) {
  const { type, name, body, codeType } = resource;

  // 确定保存目录
  let saveDir;
  if (type === 'code' && codeType) {
    saveDir = path.join(LOCAL_DIR, CODE_TYPE_MAP[codeType]);
  } else {
    saveDir = path.join(LOCAL_DIR, FILE_TYPE_MAP[type]);
  }

  // 确保目录存在
  ensureDirectoryExists(saveDir);

  // 确定文件扩展名
  let extension = '.html';
  if (type === 'script') extension = '.js';
  if (type === 'style') extension = '.css';
  if (type === 'api') extension = '.ts';
  if (type === 'codeblock') extension = '.ts';

  // 确定文件名
  let fileName = name;
  if (!fileName.endsWith(extension)) {
    fileName += extension;
  }

  // 完整的文件路径
  const filePath = path.join(saveDir, fileName);

  // 写入文件
  fs.writeFileSync(filePath, body);
  console.log(`已保存: ${filePath}`);

  return filePath;
}

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
 * 保存日志到 pull-json 文件夹
 * @param {Array} resources - 资源数组
 * @param {Array} resourceTypes - 资源类型数组
 * @param {Array} ignoreFiles - 忽略的文件列表
 */
function savePullJsonLog(resources, resourceTypes, ignoreFiles) {
  try {
    // 确保 pull-json 目录存在
    ensureDirectoryExists(PULL_JSON_DIR);

    // 创建日志文件名，使用当前时间戳
    const timestamp = dayjs().format('YYYY-MM-DD--HHmm');
    const logFileName = `pull-log-${timestamp}.json`;
    const logFilePath = path.join(PULL_JSON_DIR, logFileName);

    // 构建日志内容
    const logContent = {
      timestamp,
      resourceTypes,
      ignoreFiles,
      totalResources: resources.length,
      resources: resources.map(resource => ({
        type: resource.type,
        name: resource.name,
        codeType: resource.codeType,
        size: resource.body ? resource.body.length : 0
      }))
    };

    // 写入日志文件
    fs.writeFileSync(logFilePath, JSON.stringify(logContent, null, 2));
    console.log(`日志已保存到: ${logFilePath}`);
  } catch (error) {
    console.error('保存日志失败:', error);
  }
}

/**
 * 从远程拉取所有资源
 * @param {Array} resourceTypes - 要拉取的资源类型数组
 */
async function fetchAllResources(resourceTypes) {
  try {
    console.log('开始从远程拉取资源...');

    // 读取忽略文件列表
    const ignoreFiles = readKbIgnoreFile();
    if (ignoreFiles.length > 0) {
      console.log(`将忽略以下文件: ${ignoreFiles.join(', ')}`);
    }

    const response = await axios.post(EXPORT_API_URL, { 
      resourceTypes,
      ignoreFiles: ignoreFiles 
    });

    if (response.status === 200 && response.data.success) {
      console.log('资源拉取成功！');
      
      // 保存日志
      savePullJsonLog(response.data.resources, resourceTypes, ignoreFiles);
      
      return response.data.resources;
    } else {
      console.error('资源拉取失败！');
      console.error(response.data);
      return null;
    }
  } catch (error) {
    console.error('拉取资源时发生错误：', error);
    return null;
  }
}

/**
 * 保存拉取的资源到本地
 * @param {Array} resources - 资源数组
 */
function saveResourcesToLocal(resources) {
  if (!resources || !Array.isArray(resources)) {
    console.error('没有可保存的资源！');
    return;
  }

  console.log(`准备保存 ${resources.length} 个资源到本地...`);

  // 创建备份目录
  //   const backupDir = path.join(LOCAL_DIR, 'backups', dayjs().format('YYYY-MM-DD--HHmm'));
  //   ensureDirectoryExists(backupDir);

  // 保存原始资源数据
  // fs.writeFileSync(
  //   path.join(backupDir, 'resources.json'), 
  //   JSON.stringify(resources, null, 2)
  // );

  // 保存每个资源到对应文件
  const savedFiles = [];
  for (const resource of resources) {
    try {
      const filePath = saveResourceToFile(resource);
      savedFiles.push(filePath);
    } catch (error) {
      console.error(`保存资源 ${resource.name} 失败:`, error);
    }
  }

  console.log(`成功保存 ${savedFiles.length} 个资源到本地`);
  return savedFiles;
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);

  // 默认拉取所有类型的资源
  const defaultTypes = ['view', 'page', 'script', 'style', 'layout', 'api', 'codeblock'];

  if (args.length === 0) {
    return defaultTypes;
  }

  // 检查是否有 --types 参数
  const typesIndex = args.indexOf('--types');
  if (typesIndex !== -1 && typesIndex < args.length - 1) {
    // 获取类型列表
    const typesList = args[typesIndex + 1].split(',').map(type => type.trim());
    return typesList;
  }

  return defaultTypes;
}

/**
 * 主函数
 */
async function main() {
  const resourceTypes = parseArgs();
  console.log(`将拉取以下类型的资源: ${resourceTypes.join(', ')}`);

  const resources = await fetchAllResources(resourceTypes);
  if (resources) {
    saveResourcesToLocal(resources);
  }
}

// 执行主函数
main(); 
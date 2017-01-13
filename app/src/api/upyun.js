import { range, path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import request from 'request'
import { createReadStream, createWriteStream, readdirSync, statSync, existsSync, mkdirSync } from 'fs'
import { basename, join } from 'path'
import urlParse from 'url'
import { getAuthorizationHeader, md5sum, getUri, standardUri, sleep, getFilenameFromUrl, isDir } from './tool.js'
import store from '../vuex/store' // 不能解构, 因为这时 store 还没完成初始化
const DEFAULT_HOSTNAME = 'v0.api.upyun.com'


export const getRequestOpts = ({ user = path(['state', 'user'], store), toUrl = '', method = 'GET', headers = {} } = {}) => {
  const url = urlParse.resolve(`http://${DEFAULT_HOSTNAME}/${user.bucketName}/`, encodeURIComponent(toUrl))
  const authHeader = getAuthorizationHeader({ ...user, method: method, url })
  return {
    method,
    url,
    headers: {
      ...authHeader,
      ...headers,
    },
  }
}

// 授权认证
export const checkAuth = user => {
  return new Promise((resolve, reject) => {
    request(
      getRequestOpts({ method: 'GET', toUrl: '?usage', user }),
      (error, response, body) => {
        if (error) reject(error)
        if (response.statusCode === 200) {
          resolve({ operatorName, passwordMd5: passwordMd5, bucketName })
        } else {
          reject(body)
        }
      })
  })
}

// 获取目录列表信息
export const getListDirInfo = (remotePath = '') => {
  return new Promise((resolve, reject) => {
    request(
      getRequestOpts({ method: 'GET', toUrl: remotePath }),
      (error, response, body) => {
        if (error) reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`目录: ${remotePath} 获取成功`, { body: response.body, statusCode: response.statusCode })
        try {
          compose(
            resolve,
            assoc('path', remotePath),
            ifElse(
              isEmpty,
              () => ({ data: [] }),
              compose(
                objOf('data'),
                compose(
                  map(converge(assoc, [
                    always('uri'),
                    converge(concat, [
                      compose(concat(remotePath), prop('filename')),
                      compose(ifElse(equals('F'), always('/'), always('')), prop('folderType')),
                    ]),
                    identity,
                  ])),
                  map(compose(zipObj(['filename', 'folderType', 'size', 'lastModified']), split(/\t/))),
                  split(/\n/))))
          )(body)
        } catch (err) {
          reject(err)
        }

      })
  })
}

// 上传文件
// relativePath 是相对当前目录的路径
export const upload = (remotePath = '', localFilePath = '', relativePath = '') => {
  return new Promise((resolve, reject) => {
    createReadStream(localFilePath)
      .on('data', function (chunk) {
        console.info(chunk.length, +new Date());
      })
      .pipe(request(
        getRequestOpts({ method: 'PUT', toUrl: remotePath + relativePath + basename(localFilePath) }),
        (error, response, body) => {
          if (error) reject(error)
          if (response.statusCode !== 200) reject(error)
          console.info(`文件: ${localFilePath} 上传成功`, { body: response.body, statusCode: response.statusCode })
          resolve(body)
        }
      ))
  })
}

// 创建目录
export const createFolder = (remotePath = '', folderName = '') => {
  return new Promise((resolve, reject) => {
    request(
      getRequestOpts({ method: 'POST', toUrl: remotePath + folderName + '/', headers: { folder: true } }),
      (error, response, body) => {
        if (error) reject(error)
        if (response.statusCode !== 200) return reject(error)
        console.info(`文件夹: ${folderName} 创建成功`, { body: response.body, statusCode: response.statusCode })
        resolve(body)
      })
  })
}

// 上传多个文件
// @TODO 控制并发数量
export const uploadFiles = (remotePath = '', localFilePaths = []) => {
  for (const localPath of localFilePaths) upload(remotePath, localPath)
}

// 上传多个文件夹
// @TODO 控制并发数量
export const uploadFloders = (remotePath, localFolderPaths = []) => {
  const result = []
  // 递归遍历目录
  // const parseFolder = (nodes, fromPath) => {
  //   for (const node of nodes) statSync(node).isDirectory() ?
  //     parseFolder(readdirSync(node).map(name => join(node, name)), fromPath + basename(node) + '/') :
  //     result.push({ localFilePath: node, relativePath: fromPath })
  // }
  // parseFolder(localFolderPaths, '')
  // 广度优先遍历
  let list = localFolderPaths.slice().map(path => ({ localFilePath: path, relativePath: '' }))
  while (list.length) {
    const node = list.shift()
    const {localFilePath, relativePath} = node
    if (statSync(localFilePath).isDirectory() && readdirSync(localFilePath).length) {
      list = list.concat(readdirSync(localFilePath).map(name => ({
        localFilePath: join(localFilePath, name),
        relativePath: relativePath + basename(localFilePath) + '/',
      })))
    } else {
      result.push(node)
    }
  }
  for (const pathObj of result) statSync(pathObj.localFilePath).isFile() ?
    upload(remotePath, pathObj.localFilePath, pathObj.relativePath) :
    createFolder(remotePath, pathObj.relativePath + basename(pathObj.localFilePath))
}

// 删除文件
export const deleteFile = remotePath => {
  return new Promise((resolve, reject) => {
    request(
      getRequestOpts({ method: 'DELETE', toUrl: remotePath }),
      (error, response, body) => {
        if (error) reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`文件: ${remotePath} 删除成功`, { body: response.body, statusCode: response.statusCode })
        resolve(body)
      }
    )
  })
}

// 遍历目录
export const traverseDir = async (remotePaths = '', opts = {}) => {
  let files = []
  // 递归遍历目录
  const parseDir = async (paths, fromPath = '') => {
    for (const path of paths) {
      try {
        files.push({
          absolutePath: path,
          relativePath: fromPath,
        })
        if (isDir(path)) {
          const dirData = await getListDirInfo(path)
          if (dirData && dirData.data && dirData.data.length) await parseDir(dirData.data.map(fileObj => fileObj.uri), fromPath + basename(path) + '/')
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  await parseDir(remotePaths)
  files = files.reverse()

  if(opts.type === 'file') {
    files = files.filter(f => !isDir(f.absolutePath))
  }

  if(opts.type === 'folder') {
    files = files.filter(f => isDir(f.absolutePath))
  }

  if(opts.relative !== true) {
    files = files.map(o => o.absolutePath)
  }

  return files
}

export const checkList = async (remoteFilePath = '') => {
  try {
    const data = await getListDirInfo(remoteFilePath)
    if (!data.data.length) return true
    return false
  } catch (err) {
    return false
  }
}

// 轮循
export const polling = async (func, times = 10, space = 500) => {
  for (const i of Array(times).keys()) {
    await sleep(space)
    const result = await func()
    if (result) return true
  }
  return false
}

// 删除多个文件
// @TODO 控制并发数量
export const deleteFiles = async remotePaths => {
  const waitDeleteInit = await traverseDir(remotePaths)
  console.log(waitDeleteInit)
  const deleteError = []

  for (const remoteFilePath of waitDeleteInit) {
    try {
      await deleteFile(remoteFilePath)
    } catch (err) {
      console.error(`删除失败：path: ${remoteFilePath}, error: ${err}`)
      deleteError.push(remoteFilePath)
    }
  }

  return deleteError
}

// 下载单个文件
export const downloadFile = async (dirPath, fileName, singleDownloadPath) => {
  // if()
  request
    .get(encodeURI(singleDownloadPath))
    .on('data', (chunk) => {
      console.info(chunk.length, +new Date());
    })
    .pipe(createWriteStream(localPath))
    .on('finish', () => {
      console.info('下载完成')
    })
}

// 递归获取不重复名字
export const getLocalName = (fileName = '') => {
  if(!existsSync(fileName)) return fileName
  const match = /\((\d+)\)$/
  if(match.test(fileName)) {
    return getLocalName(fileName.replace(match, (match, p1) => `(${parseInt(p1) + 1})`))
  } else {
    return getLocalName(fileName + '(1)')
  }
}

// 下载文件
// @TODO 控制并发数量
export const downloadFiles = async (destPath, downloadPath) => {
  console.log(destPath)
  console.log(await traverseDir(downloadPath, {relative: true}))
  // for(const singleDownloadPath of downloadPath) {
  //   const localPath = getLocalName(join(destPath, getFilenameFromUrl(singleDownloadPath)))
  //   console.log(localPath)
  // }
  // downloadFile(destPath, downloadPath[0])
}
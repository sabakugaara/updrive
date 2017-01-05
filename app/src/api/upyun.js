import { path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import request from 'request'
import { createReadStream, readdirSync, statSync } from 'fs'
import { basename, join } from 'path'
import urlParse from 'url'
import { getAuthorizationHeader, md5sum, getUri, standardUri } from './tool.js'
import store from '../vuex/store' // 不能解构, 因为这时 store 还没完成初始化

const DEFAULT_HOSTNAME = 'v0.api.upyun.com'

export const getRequestOpts = ({ user = path(['state', 'user'], store), toUrl = '', method = 'GET', headers = {} } = {}) => {
  const url = encodeURI(urlParse.resolve(`http://${DEFAULT_HOSTNAME}/${user.bucketName}/`, toUrl))
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
        if (!error && response.statusCode === 200) {
          console.info(`目录: ${remotePath} 刷新成功`, { body: response.body, statusCode: response.statusCode })
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
        } else {
          reject(body)
        }
      })
  })
}

// 上传文件
// relativePath 是相对当前目录的路径
export const upload = ({localFilePath = '', remotePath = '', relativePath = ''} = {}) => {
  return new Promise((resolve, reject) => {
    createReadStream(localFilePath)
      .on('data', function (chunk) {
        console.info(chunk.length, +new Date());
      })
      .pipe(request(
        getRequestOpts({ method: 'PUT', toUrl: remotePath + relativePath + basename(localFilePath) }),
        (error, response, body) => {
          if (error) reject(error)
          console.info(`文件: ${localFilePath} 上传成功`, { body: response.body, statusCode: response.statusCode })
          resolve(body)
        }
      ))
  })
}

// 创建目录
export const createFolder = ({folderName = '', remotePath = ''} = {}) => {
  return new Promise((resolve, reject) => {
    request(
      getRequestOpts({ method: 'POST', toUrl: remotePath + folderName + '/', headers: { folder: true } }),
      (error, response, body) => {
        if (error) reject(error)
        console.info(`文件夹: ${folderName} 创建成功`, { body: response.body, statusCode: response.statusCode })
        resolve(body)
      })
  })
}

// 上传多个文件
// @TODO 控制并发数量
export const uploadFiles = ({ localFilePaths = [], remotePath = '' } = {}) => {
  const uploadWithLocalPath = localFilePath => upload({ localFilePath, remotePath })
  for (const localPath of localFilePaths) uploadWithLocalPath(localPath)
}

// 上传多个文件夹
// @TODO 控制并发数量
export const uploadFloders = ({ localFolderPaths = [], remotePath = '' } = {}) => {
  const uploadWithLocalPathAndRelativePath = pathObj => upload({ remotePath, ...pathObj })
  const createFolderWithD = pathObj => upload({ remotePath, ...pathObj })
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
    upload({ remotePath, ...pathObj }) :
    createFolder({ remotePath, folderName: pathObj.relativePath + basename(pathObj.localFilePath) })
}

// 删除文件
export const deleteFile = (user, { remotePath } = {}) => {
  const url = encodeURI(`http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}`)
  const method = 'PUT'
  return new Promise((resolve, reject) => {
    createReadStream(localFilePath)
      .on('data', function (chunk) {
        console.info(chunk.length, +new Date());
      })
      .pipe(request(
        {
          method,
          url,
          headers: {
            ...getAuthorizationHeader({ ...user, method, url }),
          },
        },
        (error, response, body) => {
          if (error) reject(error)
          console.info(`文件: ${localFilePath} 上传成功`, { body: response.body, statusCode: response.statusCode })
          resolve(body)
        }
      ))
  })
}
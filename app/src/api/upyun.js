import { split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import request from 'request'
import { createReadStream, readdirSync, statSync } from 'fs'
import { basename, join } from 'path'

import { getAuthorizationHeader, md5sum, getUri, standardUri } from './tool.js'

const DEFAULT_HOSTNAME = 'v0.api.upyun.com'

// 授权认证
export const checkAuth = (user) => {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = encodeURI(`http://${DEFAULT_HOSTNAME}/${user.bucketName}/?usage`)
    request({
      method,
      url,
      headers: {
        ...getAuthorizationHeader({ ...user, method, url }),
      },
    }, (error, response, body) => {
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
export const getListDirInfo = (user, {remotePath = ''} = {}) => {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = encodeURI(`http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}`)
    request({
      method,
      url,
      headers: {
        ...getAuthorizationHeader({ ...user, method, url }),
      },
    }, (error, response, body) => {
      if (error) reject(error)
      if (!error && response.statusCode === 200) {
        console.info(`目录: ${remotePath} 刷新成功`, { body: response.body, statusCode: response.statusCode })
        try {
          compose(
            resolve,
            compose(assoc('path'), standardUri)(remotePath),
            ifElse(
              isEmpty,
              () => ({ data: [] }),
              compose(
                objOf('data'),
                compose(
                  map(converge(assoc, [
                    always('uri'),
                    converge(concat, [
                      compose(concat(standardUri(remotePath)), prop('filename')),
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
export const upload = (user, {localFilePath = '', remotePath = '', relativePath = ''} = {}) => {
  const url = encodeURI(`http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}${relativePath}${basename(localFilePath)}`)
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

// 创建目录
export const createFolder = (user, {folderName = '', remotePath = ''} = {}) => {
  const url = encodeURI(`http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}${folderName}/`)
  const method = 'POST'
  return new Promise((resolve, reject) => {
    request({
      method,
      url,
      headers: {
        folder: true,
        ...getAuthorizationHeader({ ...user, method, url }),
      },
    }, (error, response, body) => {
      if (error) reject(error)
      console.info(`文件夹: ${folderName} 创建成功`, { body: response.body, statusCode: response.statusCode })
      resolve(body)
    })
  })
}

// 上传多个文件
// @TODO 控制并发数量
export const uploadFiles = (user, {localFilePaths = [], remotePath = ''} = {}) => {
  const uploadWithLocalPath = localFilePath => upload(user, { localFilePath, remotePath })
  for (const localPath of localFilePaths) uploadWithLocalPath(localPath)
}

// 上传多个文件夹
// @TODO 控制并发数量
export const uploadFloders = (user, {localFolderPaths = [], remotePath = ''} = {}) => {
  const uploadWithLocalPathAndRelativePath = pathObj => upload(user, { remotePath, ...pathObj })
  const createFolderWithD = pathObj => upload(user, { remotePath, ...pathObj })
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
    upload(user, { remotePath, ...pathObj }) :
    createFolder(user, { remotePath, folderName: pathObj.relativePath + basename(pathObj.localFilePath) })
}
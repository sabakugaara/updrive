import { split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import request from 'request'
import fs from 'fs'
import { basename } from 'path'

import { getAuthorizationHeader, md5sum, getUri, standardUri } from './tool.js'

const DEFAULT_HOSTNAME = 'v0.api.upyun.com'

// 授权认证
export const checkAuth = (user) => {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = `http://${DEFAULT_HOSTNAME}/${user.bucketName}/?usage`
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
    const url = `http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}`
    request({
      method,
      url,
      headers: {
        ...getAuthorizationHeader({ ...user, method, url }),
      },
    }, (error, response, body) => {
      if (error) reject(error)
      if (!error && response.statusCode === 200) {
        console.log('目录刷新成功', {body: response.body, statusCode: response.statusCode})
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
export const upload = (user, {localFilePath = '', remotePath = ''} = {}) => {
  const url = encodeURI(`http://${DEFAULT_HOSTNAME}${getUri(user.bucketName)(remotePath)}${basename(localFilePath)}`)
  const method = 'PUT'
  return new Promise((resolve, reject) => {
    fs.createReadStream(localFilePath)
      .on('data', function (chunk) {
        console.log(chunk.length, +new Date());
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
      // console.log(error, response, body)
      console.log(`文件夹: ${folderName} 创建成功`, {body: response.body, statusCode: response.statusCode})
      resolve(body)
    })
  })
}

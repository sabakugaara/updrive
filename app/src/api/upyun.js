import request from 'request'
import {split, map, zipObj, compose, objOf} from 'ramda';


import { getAuthorizationHeader, md5sum, getUri } from './tool.js'

const DEFAULT_HOSTNAME = 'v0.api.upyun.com'

export const checkAuth = ({bucketName = '', operatorName = '', password = ''} = {}) => {
  const passwordMd5 = md5sum(password)
  return new Promise((resolve, reject) => {
    const date = (new Date()).toGMTString()
    request({
      url: `http://${DEFAULT_HOSTNAME}/${bucketName}/?usage`,
      headers: {
        Authorization: getAuthorizationHeader({ operatorName, passwordMd5, path: `/`, bucketName, date }),
        Date: date,
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

export const getListDirInfo = ({bucketName = '', operatorName = '', passwordMd5 = '', path = ''} = {}) => {
  return new Promise((resolve, reject) => {
    const date = (new Date()).toGMTString()
    request({
      url: `http://${DEFAULT_HOSTNAME}${getUri(bucketName)(path)}`,
      headers: {
        Authorization: getAuthorizationHeader({ operatorName, passwordMd5, path, bucketName, date }),
        Date: date,
      },
    }, (error, response, body) => {
      if (error) reject(error)
      if (!error && response.statusCode === 200) {
        try {
          compose(resolve, compose(
            objOf('data'),
            compose(
              map(compose(zipObj(['filename', 'folderType', 'size', 'lastModified']), split(/\t/))),
              split(/\n/))))(body)
        } catch (err) {
          reject(err)
        }
      } else {
        console.log(response)
        reject(body)
      }
    })
  })
}

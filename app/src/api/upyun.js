import {split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals} from 'ramda';
import request from 'request'


import { getAuthorizationHeader, md5sum, getUri, standardUri } from './tool.js'

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
          compose(
            resolve,
            compose(assoc('path'), standardUri)(path),
            ifElse(
              isEmpty,
              () => ({data: []}),
              compose(
                objOf('data'),
                compose(
                  map(converge(assoc, [
                    always('uri'),
                    converge(concat, [
                      compose(concat(standardUri(path)) ,prop('filename')),
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

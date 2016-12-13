import crypto from 'crypto';
import { replace, compose } from 'ramda';

export const md5sum = data => crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const base64 = (str = '') => (new Buffer(str).toString('base64'))

export const standardUri = compose(replace(/(\/*)$/, '/'), replace(/^(\/*)/, '/'))

export const makeSign = ({method, uri, date, contentLength, passwordMd5, operatorName} = {}) => {
  return (`UpYun ${operatorName}:${md5sum(`${method}&${uri}&${date}&${contentLength}&${passwordMd5}`)}`)
}

export const getUri = (bucketName = '') => (path = '') => {
  const replaceHeader = replace(/^(\/+)/)('')
  const replaceTail = replace(/(\/*)$/)('/')
  const replaceHeaderAndTail = compose(replaceTail, replaceHeader)
  return encodeURI('/'.concat(replaceHeaderAndTail(bucketName)).concat(replaceHeaderAndTail(path)))
}

export const getAuthorizationHeader = ({method = 'GET', path = '', contentLength = 0, passwordMd5, operatorName, bucketName} = {}) => {
  const date = (new Date()).toGMTString()
  return {
    Authorization: makeSign({
      operatorName,
      date,
      passwordMd5,
      contentLength,
      uri: getUri(bucketName)(path),
      method: method.toUpperCase(),
    }),
    Date: date,
    'content-length': contentLength,
  }
}





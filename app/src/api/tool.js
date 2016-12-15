import crypto from 'crypto';
import { parse } from 'url';
import { replace, compose } from 'ramda';

export const md5sum = data => crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const base64 = (str = '') => (new Buffer(str).toString('base64'))

export const standardUri = (path = '') => {
  const pathStr = Array.isArray(path) ? path.join('/') : path
  return compose(replace(/(\/*)$/, '/'), replace(/^(\/*)/, '/'))(pathStr)
}

export const makeSign = ({method, uri, date, contentLength, passwordMd5, operatorName} = {}) => {
  return (`UpYun ${operatorName}:${md5sum(`${method}&${uri}&${date}&${contentLength}&${passwordMd5}`)}`)
}

export const getUri = (bucketName = '') => (path = '') => {
  return encodeURI(`/${bucketName}${standardUri(path)}`)
}

export const getAuthorizationHeader = ({method = 'GET', url = '', contentLength = 0, passwordMd5, operatorName, bucketName} = {}) => {
  const date = (new Date()).toGMTString()
  return {
    Authorization: makeSign({
      operatorName,
      date,
      passwordMd5,
      contentLength,
      uri: parse(url).pathname,
      method: method.toUpperCase(),
    }),
    Date: date,
    'Content-Length': contentLength,
  }
}





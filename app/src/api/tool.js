import crypto from 'crypto';
import { parse } from 'url';
import { replace, compose } from 'ramda';

export const md5sum = data => crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const hmacSha1 = (secret, data) => crypto.createHmac('sha1', secret).update(data, 'utf8').digest().toString('base64')

export const base64 = (str = '') => (new Buffer(str).toString('base64'))

export const standardUri = (path = '') => {
  const pathStr = Array.isArray(path) ? path.join('/') : path
  return compose(replace(/(\/*)$/, '/'), replace(/^(\/*)/, '/'))(pathStr)
}

export const makeSign = ({method, uri, date, passwordMd5, operatorName} = {}) => {
  return (`UPYUN ${operatorName}:${hmacSha1(passwordMd5, [method, uri, date].join('&'))}`)
}

export const getUri = (bucketName = '') => (path = '') => {
  return encodeURI(`/${bucketName}${standardUri(path)}`)
}

// TODO 实现 Content-MD5 校验
export const getAuthorizationHeader = ({method = 'GET', url = '', passwordMd5, operatorName} = {}) => {
  const date = (new Date()).toGMTString()
  console.log(makeSign({
    operatorName,
    passwordMd5,
    date,
    uri: parse(url).pathname,
    method: method.toUpperCase(),
  }))
  return {
    Authorization: makeSign({
      operatorName,
      passwordMd5,
      date,
      uri: parse(url).pathname,
      method: method.toUpperCase(),
    }),
    Date: date,
  }
}





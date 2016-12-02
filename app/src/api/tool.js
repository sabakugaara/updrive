import crypto from 'crypto';
import { replace, compose } from 'ramda';

export const md5sum = data => crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const makeSign = ({method, uri, date, contentLength, passwordMd5, operatorName} = {}) => {
  return (`UpYun ${operatorName}:${md5sum(`${method}&${uri}&${date}&${contentLength}&${passwordMd5}`)}`)
}

export const getUri = (bucketName = '') => (path = '') => {
  const replaceHeader = replace(/^(\/+)/)('')
  const replaceTail = replace(/(\/*)$/)('/')
  const replaceHeaderAndTail = compose(replaceTail, replaceHeader)
  return encodeURI('/'.concat(replaceHeaderAndTail(bucketName)).concat(replaceHeaderAndTail(path)))
}

export const getAuthorizationHeader = ({method = 'GET', path = '', length = 0, passwordMd5, operatorName, bucketName, date} = {}) =>
  makeSign({
    operatorName,
    date,
    passwordMd5,
    uri: getUri(bucketName)(path),
    method: method.toUpperCase(),
    contentLength: length,
  })





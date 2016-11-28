import crypto from 'crypto';
import R from 'ramda';

export const md5sum = data => crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const makeSign = ({method, uri, date, contentLength, passwordMd5, operatorName} = {}) => {
  return (`UpYun ${operatorName}:${md5sum(`${method}&${uri}&${date}&${contentLength}&${passwordMd5}`)}`)
}

export const getAuthorizationHeader = ({method = 'GET', remotePath = '/', length = 0, passwordMd5, operatorName, bucketName, date} = {}) =>
  makeSign({
    operatorName,
    date,
    passwordMd5,
    uri: `/${bucketName}${remotePath}`,
    method: method.toUpperCase(),
    contentLength: length,
  })





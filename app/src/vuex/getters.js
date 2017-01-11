import { path } from 'ramda'

export const cname = state => {
  const bucketName = path(['user', 'bucketName'], state)
  return 'http://' + bucketName + '.b0.upaiyun.com/'
}
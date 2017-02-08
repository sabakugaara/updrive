import { path } from 'ramda'
import { last } from 'ramda'

export const cname = state => {
  const bucketName = path(['user', 'bucketName'], state)
  return 'http://' + bucketName + '.b0.upaiyun.com/'
}

export const restApiHost = state => {
  return 'v0.api.upyun.com'
}

export const backUri = state => {
  const backStack = path(['list', 'history', 'backStack'], state) || []
  return last(backStack)
}

export const forwardUri = state => {
  const forwardStack = path(['list', 'history', 'forwardStack'], state) || []
  return last(forwardStack)
}
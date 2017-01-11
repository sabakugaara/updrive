import { path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda'
import moment from 'moment'
import Ftp from 'ftp'

import store from '../vuex/store'
import { traverseDir } from './upyun'

const client = new Ftp()

client.on('ready', () => {
  console.info('--------------- ftp 连接成功 ---------------')
})

client.on('close', error => {
  console.info('--------------- ftp 已关闭 ---------------')
})

const connect = () => {
  return new Promise((resolve, reject) => {
    const user = path(['state', 'user'], store)
    if (!user) reject()
    client.connect({
      host: 'v0.ftp.upyun.com',
      user: `${user.operatorName}/${user.bucketName}`,
      password: user.password
    })
    client.once('ready', resolve)
  })
}

const end = () => {
  client.end()
}

export const getListDirInfoPromise = remotePath => {
  return new Promise((resolve, reject) => {
    client.list(remotePath, function (err, list) {
      if (err) throw err
      const data = list.map(file => {
        const filename = Buffer.from(file.name, 'binary').toString()
        return {
          filename,
          folderType: file.type === 'd' ? 'F' : 'N',
          lastModified: moment(file.date).unix(),
          size: file.size,
          uri: remotePath + filename + (file.type === 'd' ? '/' : '')
        }
      })
      const result = { data, path: remotePath }
      resolve(result)
    })
  })
}

export const getListDirInfo = async (remotePath = '') => {
  await connect()
  return getListDirInfoPromise(remotePath)
    .then(() => {
      console.info(`目录: ${remotePath} 获取成功`, result)
      end()
    })
    .catch(() => {
      end()
      return Promise.reject(err)
    })
}

export const deleteFiles = async (remotePaths = '') => {
  await connect()
  try {
    return new Promise((resolve, reject) => {
      client.rmdir(remotePaths, true, (err, cwd) => {
        if (err) throw err
        resolve()
        end()
      })
    })
  } catch (err) {
    end()
    return Promise.reject(err)
  }
}

export const renamePromise = (oldPath, newPath) => {
  return new Promise(async (resolve, reject) => {
    client.rename(oldPath, newPath, err => {
      if (err) throw err
      resolve()
    })
  })
}

export const renameFile = async (oldPath, newPath) => {
  await connect()
  return renamePromise(oldPath, newPath)
    .then(() => {
      console.info('路径修改成功', `${oldPath} => ${newPath}`)
      end()
    })
    .catch((err) => {
      end()
      return Promise.reject(err)
    })
}


export const renameFolder = async (oldPath, newPath) => {
  await connect()
  try {
    return new Promise(async (resolve, reject) => {
      const dir = await traverseDir(oldPath)
      for (const remoteFilePath of dir) {
        client.rename(oldPath, newPath, err => {
          if (err) throw err
          console.info('路径修改成功', `${oldPath} => ${newPath}`)
          resolve()
          end()
        })
      }
    })
  } catch (err) {
    end()
    return Promise.reject(err)
  }
}

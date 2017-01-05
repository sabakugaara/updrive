import { path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import Ftp from 'ftp'
import store from '../vuex/store'

const client = new Ftp()

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


export const getListDirInfo = async (remotePath = '') => {
  await connect()
  client.list('/madoka/', function (err, list) {
    console.log(list)
    if (err) throw err;
    client.end();
  })
}

// client.list('/', function (err, list) {
//   if (err) throw err;
//   console.log(list, 222);
//   client.ascii(() => {
//     client.list('/madoka', function (err, list) {
//       console.log(list.map(obj => {
//         return obj.name = Buffer.from(obj.name, 'binary').toString()
//       }), 111);
//       if (err) throw err;
//       // client.end();
//     })
//   })
//   // client.end();
// })




// client.connect({
//   host: 'v0.ftp.upyun.com',
//   user: 'iii/nanyong',
//   password: 'duranUI083692'
// })
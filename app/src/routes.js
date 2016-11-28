export default [
  {
    path: '/',
    name: 'main',
    component: require('components/Main')
  },
  {
    path: '/login',
    name: 'login',
    component: require('components/Login')
  },
  {
    path: '*',
    redirect: '/'
  }
]

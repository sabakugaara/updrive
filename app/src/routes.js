export default [
  {
    path: '/',
    name: 'landing-page',
    component: require('components/LandingPageView')
  },
  {
    path: '/home',
    name: 'home',
    component: require('components/layout/layout')
  },
  {
    path: '/login',
    name: 'login',
    component: require('components/login')
  },
  {
    path: '*',
    redirect: '/'
  }
]

import HelloWorld from '../components/HelloWorld'
import Home from '../views/Home'
import Rank from '../views/Rank'
import Paper from '../views/Paper'
import AdminLogin from "../views/AdminLogin";

export let routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '*',
    redirect: '/home'
  },
  {
    path: '/hello',
    name: 'hello',
    component: HelloWorld
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/rank',
    name: 'Rank',
    component: Rank
  },
  {
    path: '/paper',
    name: 'Paper',
    component: Paper
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: AdminLogin
  }
  ];

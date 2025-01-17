export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'debtors',
      displayName: 'menu.debtors',
      meta: {
        icon: 'folder_shared',
      },
    },
    {
      name: 'cargos',
      displayName: 'menu.cargos',
      meta: {
        icon: 'folder_shared',
      },
    },
    {
      name: 'clients',
      displayName: 'menu.clients',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'users',
      displayName: 'menu.users',
      meta: {
        icon: 'manage_accounts',
      },
    },
  ] as INavigationRoute[],
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canCommon: currentUser && currentUser.role!*1 >= 0,
    canEditor: currentUser && currentUser.role!*1 >= 1,
    canAdmin: currentUser && currentUser.role!*1 >= 2,
    canSuper: currentUser && currentUser.role!*1 >= 3,
  };
}

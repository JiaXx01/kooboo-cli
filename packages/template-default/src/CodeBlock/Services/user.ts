import UserModel from '@CodeBlock/Models/user'

export const getUserInfo = (username?: string) => {
  if (!username) username = k.account.user.userName
  let userInfo = UserModel.findOne({ user_id: username })
  if (userInfo) return userInfo

  // 未注册
  const { fullName, userName, isAdmin } = k.account.user.get(username)

  UserModel.create({
    user_id: userName,
    name: fullName || userName,
    is_admin: isAdmin,
    email: k.account.user.current.email
  })
  userInfo = UserModel.findOne({ user_id: userName })
  return userInfo
}

/**
 * 更新用户信息
 *
 */
export const updateUserInfo = (userInfo: {
  user_id: string
  name: string
  email: string
  avatar: string
}) => {
  let { user_id, name, email, avatar } = userInfo
  return UserModel.updateOne(
    {
      user_id
    },
    {
      name,
      email,
      avatar
    }
  )
}

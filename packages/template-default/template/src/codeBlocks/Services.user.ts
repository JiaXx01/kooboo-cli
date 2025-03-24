import UserModel from './Models.user'

export const getUserInfo = (username: string)=>{
    let userInfo = UserModel.findOne({ user_id: username })
    if (userInfo) return userInfo

    // 未注册
    const { fullName, userName, isAdmin } = k.account.user.get(username)

    userInfo = UserModel.create({
        user_id: userName,
        name: fullName || userName,
        is_admin: isAdmin,
        email: k.account.user.current.email,
    })
    return userInfo 
}

/**
 * 更新用户信息
 * 
 */
export const updateUserInfo = (userInfo) => {
    let { user_id, name, email, avatar } = userInfo
    return UserModel.updateOne({
        user_id
    }, {
        name, email, avatar
    })
}

import { define } from 'module:sqlite_orm'

const model = define('user', {
    user_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    is_admin: {
        type: Boolean,
    }
}, { timestamps: true })

export default model 
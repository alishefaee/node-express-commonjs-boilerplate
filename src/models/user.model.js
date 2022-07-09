import mongoose from 'mongoose'
import { UserType, RegisterType } from '../utils/consts.utils.js'
import { passwordHash } from '../utils/encrypt.utils.js'

const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String },
        role: { type: String, enum: Object.values(UserType) },
        type: { type: Number, enum: Object.values(RegisterType) }
    },
    {
        timestamps: {}
    }
)

userSchema.pre('save', async function (next) {
    let user = this

    if (!user.isModified('password')) {
        return next()
    }

    user.password = await passwordHash(user.password)

    return next()
})

export default mongoose.model('User', userSchema)

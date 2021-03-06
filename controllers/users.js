const jwt = require('jsonwebtoken')
const Users = require('../model/users')
const { HttpCode } = require('../helpers/constants')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_SECRET

// /auth/register
const register = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await Users.findByEmail(email)
        if (user) {
            return res.status(HttpCode.CONFLICT).json({
                status: 'error',
                code: HttpCode.CONFLICT,
                data: 'Conflict',
                message: 'Email in use',
            })
        }

        const newUser = await Users.create(req.body)
        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            data: {
                // id: newUser.id,
                email: newUser.email,
                subscription: newUser.subscription,
            },
        })
    } catch (e) {
        next(e)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await Users.findByEmail(email)
        const isValidPassword = await user.validPassword(password)
        if (!user || !isValidPassword) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                data: 'Unauthorized',
                message: 'Email or password is wrong', // или 'Invalid credentials'
            })
        }

        const id = user._id
        const payload = { id } // можно + email + subscription
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '12h' })
        await Users.updateToken(id, token)
        return res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: { token },
        })
    } catch (e) {
        next(e)
    }
}
const logout = async (req, res, next) => {}

module.exports = { register, login, logout }

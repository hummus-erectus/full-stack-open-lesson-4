const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (!password) {
        return response.status(400).json({ error: 'You must provide a password' })
    }

    if (password.length < 3) {
        return response.status(400).json({ error: 'Password must be at least 3 characters' })
    }


    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (error) {
        if (error.name === 'ValidationError') {
            if (error.errors.username.kind === 'unique') {
                return response.status(409).json({ error: 'Username is already taken' })
            }
            return response.status(400).json({ error: error.message })
        }
        throw error
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

module.exports = usersRouter
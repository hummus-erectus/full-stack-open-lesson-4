const blogsRouter = require ('express').Router()
const jwt = require('jsonwebtoken')
const config = require("../utils/config")
const middleware = require("../utils/middleware")
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  })

  blogsRouter.post('/', async (request, response) => {
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if(!request.body.title || !request.body.url){
        return response.status(400).end()
    }

    const blog = new Blog({
        ...request.body,
        user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    // Use .populate() method to join the user information to the blog object
    const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })

    response.status(201).json(populatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        response.json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter
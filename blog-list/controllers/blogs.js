const blogsRouter = require ('express').Router()
const jwt = require('jsonwebtoken')
const config = require("../utils/config")
// const { userExtractor } = require('../utils/middleware')
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
    const user = request.user
    const token = request.token
    const body = request.body

    const decodedToken = jwt.verify(token, config.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    if(!body.title || !body.url){
        return response.status(400).end()
    }

    if(!body.likes){
        body.likes=0
    }

    const blog = new Blog({
        ...body,
        user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })

    response.status(201).json(populatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    const user = request.user

    if (!user || blog.user.toString() !== user.id.toString()) {
      return response.status(401).json({ error: 'operation not permitted' })
    }

    // user.blogs.map(b => console.log( (b.toString() !== blog.id.toString() ), (b.toString())) )
    user.blogs = user.blogs.filter(b => b.toString() !== blog.id.toString())
    // console.log('blog.id.toString()', blog.id.toString())

    await user.save()
    await blog.remove()

    response.status(204).end()

  })

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    if(!body.title || !body.url){
        return response.status(400).end()
    }

    if(!body.likes){
        body.likes=0
    }

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: body.user.id
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
        response.json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter
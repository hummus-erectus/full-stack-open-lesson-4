const blogsRouter = require ('express').Router()
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

    const user = await User.findById("642ce5476dfc2f775a33565a")
    console.log(user)

    const blog = new Blog({
        ...request.body,
        user: user
    })

    if(!blog.title || !blog.url){
        response.status(400).end()
    } else {
        if(!blog.likes){
            blog.likes = 0
        }
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)
    }
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

    Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
        response.json(updatedBlog)
    })
    .catch(error => next(error))
})

module.exports = blogsRouter
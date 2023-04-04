const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
const promiseArray = blogObjects.map(blog => blog.save())
await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 100000)

test('there are three blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(3)
}, 100000)

test('UID of the blog posts is named "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
}, 100000)

test('A new blog can be added', async () => {
    const newBlog = {
        title: "A new blog",
        author: "Mr Slut",
        url: "www.wowee.org/yikes",
        likes: 50
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
        "A new blog"
    )
}, 100000)

test('if the likes property is missing, default to 0', async () => {
    const newBlog = {
        title: "A blog nobody likes",
        author: "Mrs de Bus",
        url: "www.whocares.org/sowhat"
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body[response.body.length-1].likes).toBe(0)

}, 100000)

test('if the title property is missing, respond with status 400', async () => {
    const newBlog = {
        author: "Purple Dave",
        url: "www.manycats.org/nodogs",
        likes: 42
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

}, 100000)

test('if the url property is missing, respond with status 400', async () => {
    const newBlog = {
        title: "Not enough squirrels",
        author: "Nuts Abundance II",
        likes: 24
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

}, 100000)

test('deletion succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.content)

    expect(titles).not.toContain(blogToDelete.title)
}, 100000)

test('information about a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

    const response = await api.get(`/api/blogs/${blogToUpdate.id}`)
    expect(response.body.likes).toBe(blogToUpdate.likes + 1)

}, 100000)

afterAll(async () => {
    await mongoose.connection.close()
})
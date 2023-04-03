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
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const authors = response.body.map(r => r.author)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(authors).toContain(
        'Mr Slut'
    )
}, 100000)

afterAll(async () => {
    await mongoose.connection.close()
})
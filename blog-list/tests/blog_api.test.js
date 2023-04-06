const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')

const Blog = require('../models/blog')
const User = require('../models/user')

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

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper status code and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(409)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Username is already taken')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    }, 100000)

    test('creation fails with proper status code and message if username is not provided', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: '',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('User validation failed: username: Path `username` is required.')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    }, 100000)

    test('creation fails with proper status code and message if username is less than three characters in length', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Te',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('shorter than the minimum allowed length')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    }, 100000)

    test('creation fails with proper status code and message if password is not provided', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Testuser',
            name: 'Matti Luukkainen',
            password: '',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('You must provide a password')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    }, 100000)

    test('creation fails with proper status code and message if password is less than three characters in length', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Testuser',
            name: 'Matti Luukkainen',
            password: 'ab',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Password must be at least 3 characters')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    }, 100000)
})

afterAll(async () => {
    await mongoose.connection.close()
})
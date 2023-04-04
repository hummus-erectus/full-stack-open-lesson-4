const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "Great reads",
        author: "Mr Slut",
        url: "www.wowee.org/books",
        likes: 20
    },
    {
        title: "Life hacks for rhinos",
        author: "Rhianna Hippo",
        url: "www.zoomimals.org/today",
        likes: 30
    },
    {
        title: "Chocolate teapots",
        author: "Useless Mark",
        url: "www.justwhy.org/what",
        likes: 25
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }

module.exports = {
    initialBlogs,
    blogsInDb
  }
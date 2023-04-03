/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://robertsamuelgrayson:${password}@fullstackcluster.hywqmef.mongodb.net/testbloglist?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)


if (process.argv.length === 3) {
  console.log('Blog-list:')
  Blog.find({}).then(result => {
    result.forEach(blog => {
      console.log(`${blog.title} ${blog.author}`)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 7){
  const blog = new Blog({
    title: process.argv[3],
    author: process.argv[4],
    url: process.argv[5],
    likes: process.argv[6]
  })

  blog.save().then(result => {
    console.log(`Added ${result.title} by ${result.author} to blog list`)
    mongoose.connection.close()
  })
}




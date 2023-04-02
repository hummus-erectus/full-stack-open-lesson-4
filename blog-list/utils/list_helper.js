const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce(
        (acc, curr) => acc + curr.likes, 0
    )
}

const favoriteBlog = (blogs) => {
    if(blogs.length <1){
        return "List is empty"
    }
    let maxLikesBlog = blogs.reduce((acc, curr) => {
        return acc.likes > curr.likes ? acc : curr
    })
    return {
        title: maxLikesBlog.title,
        author: maxLikesBlog.author,
        likes: maxLikesBlog.likes
    }
}

const mostBlogs = (blogs) => {
    if(blogs.length <1){
        return "List is empty"
    }
    const groups = _.groupBy(blogs, 'author')
    const author = _.maxBy(_.keys(groups), (author) => {
        return groups[author].length;
    })
    return { author: author, blogs: groups[author].length }
}

function mostLikes(blogs) {
    if(blogs.length <1){
        return "List is empty"
    }
    const likesByAuthor = {}
    blogs.forEach((blog) => {
      if (!likesByAuthor[blog.author]) {
        likesByAuthor[blog.author] = 0
      }
      likesByAuthor[blog.author] += blog.likes
    })
    const author = _.maxBy(_.keys(likesByAuthor), (author) => {
      return likesByAuthor[author]
    })
    return { author: author, likes: likesByAuthor[author] }
  }

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
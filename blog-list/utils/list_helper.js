const dummy = (blogs) => {
    return 1
}
const totalLikes = (blogs) => {
    return blogs.reduce(
        (acc, curr) => acc + curr.likes, 0
    )
}

const favoriteBlog = (blogs) => {
    let maxLikesBlog = blogs.reduce((acc, curr) => {
        return acc.likes > curr.likes ? acc : curr
    })
    return {
        title: maxLikesBlog.title,
        author: maxLikesBlog.author,
        likes: maxLikesBlog.likes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}
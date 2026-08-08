import { model } from "@medusajs/framework/utils"

const Post = model.define("blog_post", {
  id: model.id().primaryKey(),
  slug: model.text(),
  title: model.text(),
  excerpt: model.text(),
  content: model.text(),
  status: model.text(),
})

export default Post

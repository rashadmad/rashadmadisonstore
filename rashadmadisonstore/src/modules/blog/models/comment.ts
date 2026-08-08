import { model } from "@medusajs/framework/utils"

const Comment = model.define("blog_comment", {
  id: model.id().primaryKey(),
  post_slug: model.text(),
  author: model.text(),
  message: model.text(),
  status: model.text(),
})

export default Comment

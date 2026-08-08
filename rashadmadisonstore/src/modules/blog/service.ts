import { MedusaService } from "@medusajs/framework/utils"

import Comment from "./models/comment"
import Post from "./models/post"

class BlogModuleService extends MedusaService({
  Post,
  Comment,
}) {}

export default BlogModuleService

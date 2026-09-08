# Writing blog posts

Create one `.md` file in this folder for each post. The filename becomes the URL slug:

`my-new-post.md` becomes `/blog/my-new-post`.

Start every post with this frontmatter:

```yaml
---
title: My post title
category: Process
excerpt: A short description shown on blog cards.
publishedAt: 2026-09-03
image: /images/my-post-image.jpg
imageAlt: A concise description of the image
---
```

Place local images in `public/images`, then reference them with `/images/filename.jpg`. Write the post below the frontmatter using Markdown. Posts are sorted by `publishedAt`, newest first. Add `draft: true` to hide an unfinished post. Files beginning with `_` are ignored.
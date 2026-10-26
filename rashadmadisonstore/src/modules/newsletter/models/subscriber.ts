import { model } from "@medusajs/framework/utils"

const Subscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  first_name: model.text(),
  last_name: model.text(),
  status: model.enum(["subscribed", "unsubscribed"]).default("subscribed"),
  source: model.text(),
  consented_at: model.dateTime(),
})

export default Subscriber

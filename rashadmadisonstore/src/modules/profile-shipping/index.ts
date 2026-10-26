import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import ProfileShippingService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ProfileShippingService],
})

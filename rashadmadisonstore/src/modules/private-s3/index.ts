import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PrivateS3FileService from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [PrivateS3FileService],
})

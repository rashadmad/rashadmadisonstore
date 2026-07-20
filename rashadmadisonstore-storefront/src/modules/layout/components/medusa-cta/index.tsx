import { Text } from "@medusajs/ui"

import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center text-white">
      Powered by
      <a href="https://www.rashadmadison.com" target="_blank" rel="noreferrer">
        <img
          src="/rashadmadisoncom_logo.svg"
          alt="Rashad Madison"
          className="h-8 w-auto"
        />
      </a>
    </Text>
  )
}

export default MedusaCTA

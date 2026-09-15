"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

export const getRegion = async (countryCode: string) => {
  try {
    const lowerCountryCode = countryCode?.toLowerCase()
    const regions = await listRegions()

    if (!regions || !regions.length) {
      return null
    }

    const regionMap = new Map<string, HttpTypes.StoreRegion>()

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
          regionMap.set(c.iso_2.toLowerCase(), region)
        }
      })
    })

    const region = lowerCountryCode
      ? regionMap.get(lowerCountryCode)
      : regionMap.get("us")

    return region || regions[0]
  } catch (e: any) {
    return null
  }
}

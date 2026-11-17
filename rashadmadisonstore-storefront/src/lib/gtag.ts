type GAEventParams = Record<string, unknown>

type GtagWindow = Window & {
  gtag?: (command: "event", eventName: string, params?: GAEventParams) => void
}

export const sendGAEvent = (
  eventName: string,
  params?: GAEventParams
): void => {
  if (typeof window !== "undefined") {
    const gtag = (window as GtagWindow).gtag
    gtag?.("event", eventName, params)
  }
}

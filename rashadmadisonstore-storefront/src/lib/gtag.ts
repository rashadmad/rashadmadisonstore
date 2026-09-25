type GAEventParams = Record<string, unknown>

type GtagWindow = Window & {
  gtag?: (command: "event", eventName: string, params?: GAEventParams) => void
}

export const sendGAEvent = (
  eventName: string,
  params?: GAEventParams
): void => {
  if (typeof window !== "undefined" && (window as GtagWindow).gtag) {
    ;(window as GtagWindow).gtag("event", eventName, params)
  }
}

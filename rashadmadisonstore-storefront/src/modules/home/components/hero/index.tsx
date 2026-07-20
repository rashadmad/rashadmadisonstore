import { faInstagram } from "@fortawesome/free-brands-svg-icons"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"
import { faStripe } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32">
        <Heading
          level="h1"
          className="font-display block text-5xl leading-10 text-ui-fg-base font-bold mb-5"
        >
          This Is The Quintessential
        </Heading>
        <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans m-1">
          as of right now this is the place to
        </p>
        <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans m-1">
          celebrate and contribute to the Art projects
        </p>
        <p className="block text-2xl leading-8 text-ui-fg-subtle small:text-2xl font-sans m-1">
          of Rashad Madison
        </p>
        <div className="mt-4 flex flex-col items-center gap-4">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
          >
            Follow on Instagram
            <span className="ml-2">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
          >
            Follow on Facebook
            <span className="ml-2">
              <FontAwesomeIcon icon={faFacebook} />
            </span>
          </a>
          <a
            href="https://stripe.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
          >
            Donate via Stripe
            <span className="ml-2">
              <FontAwesomeIcon icon={faStripe} />
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Hero

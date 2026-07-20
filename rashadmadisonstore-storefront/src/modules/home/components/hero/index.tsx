import { faInstagram } from "@fortawesome/free-brands-svg-icons"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"
import { faStripe } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading level="h1" className="mb-4 font-display">
            <span className="block text-5xl leading-10 text-ui-fg-base font-bold">
              This is the Quintessential
            </span>
            <span className="mt-2 block text-2xl leading-10 text-ui-fg-subtle small:text-2xl">
              as of right now this is the place to
            </span>
            <span className="block text-2xl leading-10 text-ui-fg-subtle small:text-2xl">
              celebrate and contribute to the Art projects
            </span>
            <span className="block text-2xl leading-10 text-ui-fg-subtle small:text-2xl">
              of Rashad Madison
            </span>
          </Heading>
        </span>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
        >
          
          <Button className="mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded" variant="secondary">
            Follow on Instagram
            <span className="ml-2">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
          </Button>
          <br></br>
          <Button className="mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded" variant="secondary">
            Follow on Facebook
            <span className="ml-2">
              <FontAwesomeIcon icon={faFacebook} />
            </span>
          </Button>
          <br></br>
          <Button className="mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded" variant="secondary">
            Donate via Stripe
            <span className="ml-2">
              <FontAwesomeIcon icon={faStripe} />
            </span>
          </Button>
        
        </a>
      </div>
    </div>
  )
}

export default Hero

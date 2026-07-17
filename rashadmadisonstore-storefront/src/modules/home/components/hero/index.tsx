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
          <Heading
            level="h1"
            className="mb-4 text-5xl leading-10 text-ui-fg-base font-normal"
          >
            This is the Quintessential
          </Heading>
          <Heading
            level="h2"
            className="text-2xl leading-10 text-ui-fg-subtle font-normal"
          >
          <p>as of right now it's the place to</p>
         <p>celebrate and contribute to the Art projects</p>
         <p>and works of Rashad Madison</p>  
          </Heading>
        </span>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
        >
          
          <Button className="mt-4" variant="secondary">
            Follow on Instagram
            <span className="ml-2">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
          </Button>
          <br></br>
          <Button className="mt-4" variant="secondary">
            Follow on Facebook
            <span className="ml-2">
              <FontAwesomeIcon icon={faFacebook} />
            </span>
          </Button>
          <br></br>
          <Button className="mt-4" variant="secondary">
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

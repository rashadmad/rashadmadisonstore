import img from "placeHolderProfile.png"

const Purpose = () => {
  return (
    <section className="relative bg-gray-700 isolate overflow-hidden pb-[5px]">
      <div className="relative mx-auto max-w-7xl py-32 sm:py-40 lg:px-8 lg:py-48">
        <div className="pr-6 pl-6 md:ml-auto md:w-2/3 md:pl-16 lg:w-1/2 lg:pr-0 lg:pl-24 xl:pl-32">
          <h2 className="text-base/7 font-semibold text-white">Support an Award-winning artist</h2>
          <p className="font-display mt-2 text-4xl font-semibold tracking-tight text-green-500 sm:text-5xl dark:text-white">
            Be a part of the movement
          </p>
          <p className="mt-4 text-white small:text-2xl block font-sans text-2xl leading-8 text-ui-fg-subtle">
            Rashad is a classically trained artist taught by masters at the Savanna University of Art & Design. He plans to continue this life long art practice with the assistance of people like you. You can contribute by buying artwork from his gallery or by supporting Rashad on his Patreon page. Rashad is committed to his work in the development of Art and merchandise that shows the black form in a beautiful light. Uplifting the dignity of black men and showcasing the beauty of black women.
            Creating works in sculpture, painting, and mixed media and screen printing.
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="inline-flex items-center rounded border-b-4 border-green-700 bg-green-500 px-4 py-2 font-bold text-white hover:border-green-500 hover:bg-green-400 hover:text-yellow-300"
            >
              {' '}
              Learn more{' '}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Purpose
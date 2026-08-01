import { appCopy } from "@lib/copy"

const Purpose = () => {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex justify-center lg:justify-start">
            <img
              src="/artistProfile.png"
              alt="Artist portrait"
              className="h-auto w-full max-w-md rounded-2xl border border-gray-200/80 object-cover shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            />
          </div>

          <div className="md:ml-auto md:w-full md:pl-0 lg:pr-0 lg:pl-8 xl:pl-12">
            <h2 className="text-base font-semibold leading-7 text-green-700">{appCopy.purpose.eyebrow}</h2>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight text-green-400 sm:text-4xl">
              {appCopy.purpose.heading}
            </p>
            <p className="mt-4 block font-sans text-lg leading-7 text-gray-700 sm:text-xl sm:leading-8">
              {appCopy.purpose.body}
            </p>
            <div className="mt-8">
              <a
                href="/gallery"
                className="inline-flex items-center rounded border-b-4 border-green-700 bg-green-500 px-4 py-2 font-bold text-white hover:border-green-500 hover:bg-green-400 hover:text-yellow-300"
              >
                {appCopy.purpose.cta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Purpose
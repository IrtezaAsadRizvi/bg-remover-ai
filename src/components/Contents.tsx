import type { FC } from 'react'

const Contents: FC = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8 text-white/80 fixed -right-[400vw]">
      <h1 className="text-3xl font-semibold text-white">
        Browser-Only Background Remover for Fast, Private PNG Cutouts
      </h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Why This Background Remover</h2>
        <h3 className="mt-4 text-base font-semibold text-white">Truly serverless and private</h3>
        <p className="mt-2 text-sm leading-relaxed">
          This tool runs entirely in your browser. Images never leave your device, there is no
          server upload, no account, and no tracking. You can remove backgrounds for product
          photos, portraits, and design assets without sharing sensitive files.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Free to use with no login</h3>
        <p className="mt-2 text-sm leading-relaxed">
          There is no signup wall or subscription prompt. Just upload an image, run the model,
          and download a transparent PNG. Because everything happens locally, you keep control
          of your files and your workflow stays fast.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Key Features</h2>
        <h3 className="mt-4 text-base font-semibold text-white">Two high-quality ONNX models</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Choose U^2-Net Human Segmentation for people-focused images or ISNet General for broader
          object segmentation. Both models run in the browser using ONNX Runtime Web.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Adjustable quality controls</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Tune input size, threshold, and feathering to balance speed, detail, and edge smoothness.
          This is ideal for quick previews and for high-resolution exports.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Instant transparent PNG export</h3>
        <p className="mt-2 text-sm leading-relaxed">
          The output is a PNG with an alpha channel, ready for design tools, e-commerce listings,
          or presentations. Download instantly without any server round-trip.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Model Details</h2>
        <h3 className="mt-4 text-base font-semibold text-white">U^2-Net Human Segmentation</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Optimized for people and portraits. Great for headshots, profile images, and creator
          assets. The model typically expects a 320x320 input size and performs well on human
          silhouettes and hairlines when threshold and feather are tuned.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">ISNet General</h3>
        <p className="mt-2 text-sm leading-relaxed">
          A general-purpose foreground segmentation model that handles a wider variety of objects.
          It uses a larger input size for improved detail. Choose ISNet for products, furniture,
          and mixed scenes with complex backgrounds.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">How It Works</h2>
        <h3 className="mt-4 text-base font-semibold text-white">On-device inference</h3>
        <p className="mt-2 text-sm leading-relaxed">
          The app loads an ONNX model in a Web Worker and performs inference locally. This keeps
          the UI responsive while the model processes the image in the background.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Clean alpha composition</h3>
        <p className="mt-2 text-sm leading-relaxed">
          The resulting mask is applied to the original pixels to create a transparent background.
          You can refine the cutout by adjusting the threshold and feather sliders.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">FAQ</h2>
        <h3 className="mt-4 text-base font-semibold text-white">Is this background remover free?</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Yes. There are no paid tiers or login requirements. Everything runs locally in your browser.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Do my images upload anywhere?</h3>
        <p className="mt-2 text-sm leading-relaxed">
          No. Images are processed on-device in a Web Worker. The only network request is the model
          file, which you host locally in the public folder.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">What output format do I get?</h3>
        <p className="mt-2 text-sm leading-relaxed">
          A transparent PNG that you can use in design tools, marketplaces, and presentations.
        </p>
        <h3 className="mt-4 text-base font-semibold text-white">Which model should I use?</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Use U^2-Net Human Segmentation for portraits and people. Use ISNet General for products
          and mixed objects. Try both for best results.
        </p>
      </section>
    </div>
  )
}

export default Contents

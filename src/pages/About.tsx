import React, { useRef, useEffect } from "react";

const About: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animasi fade-in untuk image
    if (imageRef.current) {
      imageRef.current.style.opacity = "0";
      imageRef.current.style.transform = "translateY(20px)";
      setTimeout(() => {
        imageRef.current!.style.transition = "all 0.8s ease-out";
        imageRef.current!.style.opacity = "1";
        imageRef.current!.style.transform = "translateY(0)";
      }, 100);
    }

    // Animasi fade-in untuk text
    if (textRef.current) {
      textRef.current.style.opacity = "0";
      textRef.current.style.transform = "translateY(20px)";
      setTimeout(() => {
        textRef.current!.style.transition = "all 0.8s ease-out 0.2s";
        textRef.current!.style.opacity = "1";
        textRef.current!.style.transform = "translateY(0)";
      }, 100);
    }

    // Animasi fade-in + scale untuk values
    if (valuesRef.current) {
      const children = valuesRef.current.children;
      Array.from(children).forEach((child, i) => {
        const el = child as HTMLDivElement;
        el.style.opacity = "0";
        el.style.transform = "translateY(20px) scale(0.9)";
        setTimeout(() => {
          el.style.transition = `all 0.8s ease-out ${0.3 + i * 0.2}s`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0) scale(1)";
        }, 100);
      });
    }
  }, []);

  return (
    <section
      id="about-page"
      className="page py-12 px-4 bg-amber-50 text-[#4B2E0E]"
    >
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Our Story</h1>

        {/* Our Story */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 mb-12 sm:mb-16">
          <div className="md:w-1/2">
            <img
              ref={imageRef}
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6e812386-bd30-41cb-8cb7-0ea0d759dfe4.png"
              alt="Artisan coffee roasting process"
              className="rounded-lg shadow-md w-full"
            />
          </div>
          <div ref={textRef} className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">From Bean to Cup</h2>
            <p className="mb-4">
              Founded in 2010, Coffee Bliss began as a small roastery with a
              passion for exceptional coffee. Our journey started with a simple
              mission: to source the finest coffee beans from sustainable farms
              and roast them to perfection.
            </p>
            <p>
              Today, we work directly with farmers across Latin America, Africa,
              and Asia to bring you unique, flavorful coffees that tell a story
              with every sip.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div ref={valuesRef} className="bg-amber-100 rounded-lg p-6 sm:p-8 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Sustainability */}
            <div className="text-center">
              <div className="coffee-light text-white text-2xl w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Sustainability</h3>
              <p>
                We prioritize environmentally friendly practices and support
                sustainable farming methods.
              </p>
            </div>

            {/* Quality */}
            <div className="text-center">
              <div className="coffee-light text-white text-2xl w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Quality</h3>
              <p>
                Every batch is carefully roasted to highlight the unique
                characteristics of each bean.
              </p>
            </div>

            {/* Community */}
            <div className="text-center">
              <div className="coffee-light text-white text-2xl w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Community</h3>
              <p>
                We believe in building relationships with both our farmers and
                coffee enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;

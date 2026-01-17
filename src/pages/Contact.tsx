import React, { useRef, useState } from "react";

const Contact: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    setIsSending(true);

    // Ambil FormData langsung dari form (WAJIB untuk Google Apps Script)
    const formData = new FormData(form.current);

    // Endpoint Google Apps Script
    const url =
      "https://script.google.com/macros/s/AKfycbyluYgbt_0c_AEaBnmDMeHlhGfqnTeMbq5Rv8Cp_TRPA17fk0SAQNmFyxpvwfr-ufw/exec";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      alert(result);
      form.current.reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim data.");
    }
    setIsSending(false);
  };

  return (
    <section
      id="contact-page"
      className="page py-12 px-4 bg-amber-50 text-[#4B2E0E]"
    >
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Get in Touch</h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* === Form Section === */}
          <div className="md:w-1/2">
            <form
              ref={form}
              onSubmit={sendEmail}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  name="Name"
                  type="text"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  name="Email"
                  type="email"
                  placeholder="Your email"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="message"
                  name="Message"
                  rows={5}
                  placeholder="Your message"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSending}
                  className={`coffee-light text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ${
                    isSending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "hover:bg-amber-700"
                  }`}
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          {/* === Info Section === */}
          <div className="md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
              <p className="mb-4">
                123 Coffee Lane
                <br />
                Brewville, CO 12345
              </p>

              <h2 className="text-2xl font-bold mt-6 mb-4">Hours</h2>
              <p className="mb-2">Monday - Friday: 7am - 7pm</p>
              <p className="mb-2">Saturday: 8am - 8pm</p>
              <p className="mb-6">Sunday: 8am - 5pm</p>

              <h2 className="text-2xl font-bold mt-6 mb-4">Contact Info</h2>
              <p className="mb-2">Email: info@coffeebliss.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

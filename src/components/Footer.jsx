import React from "react";
function Footer() {
  return (
    <footer className="bg-[#4B2E0E] text-white text-center p-4 mt-8">
      <p>© {new Date().getFullYear()} Coffee Bliss. All rights reserved.</p>
    </footer>
  );
}
export default Footer;

// // src/components/Footer.tsx

// import React from "react";
// import {
//   FaFacebookF,
//   FaXTwitter,
//   FaYoutube,
//   FaWhatsapp,
// } from "react-icons/fa6";
// import { Link } from "react-router-dom";

// const Footer: React.FC = () => {
//   const pages = [
//     { label: "Home", href: "/" },
//     { label: "About us", href: "/about" },
//     { label: "Search", href: "/flights" },
//     { label: "Contact", href: "/support/contact" },
//     { label: "FAQ", href: "/support/faq" },
//   ];

//   const otherPages = [
//     { label: "Privacy Policy", href: "/privacy" },
//     { label: "Careers", href: "/careers" },
//     { label: "Terms & Conditions", href: "/terms" },
//     { label: "Refund", href: "/refund" },
//   ];

//   return (
//     <footer className="bg-[#0B1437] text-white">
//       {/* Main Footer Content */}
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
//           {/* Contact Us Section */}
//           <div>
//             <h3 className="text-xl font-bold mb-4">Contact Us</h3>
//             <p className="text-gray-400 text-sm mb-6 leading-relaxed">
//               Join our happy travellers and find the best accommodation deals
//               for you
//             </p>

//             {/* Socials */}
//             <div>
//               <h4 className="text-base font-semibold mb-3">Socials</h4>
//               <div className="flex gap-3">
//                 <a
//                   href="https://facebook.com/flightbooking"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
//                   aria-label="Facebook"
//                 >
//                   <FaFacebookF className="w-4 h-4" />
//                 </a>
//                 <a
//                   href="https://twitter.com/flightbooking"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
//                   aria-label="X (Twitter)"
//                 >
//                   <FaXTwitter className="w-4 h-4" />
//                 </a>
//                 <a
//                   href="https://youtube.com/@flightbooking"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
//                   aria-label="YouTube"
//                 >
//                   <FaYoutube className="w-4 h-4" />
//                 </a>
//                 <a
//                   href="https://wa.me/1234567890"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-green-500 transition"
//                   aria-label="WhatsApp"
//                 >
//                   <FaWhatsapp className="w-4 h-4" />
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Pages Section */}
//           <div>
//             <h3 className="text-xl font-bold mb-4 text-gray-400">Pages</h3>
//             <ul className="space-y-2.5">
//               {pages.map((link, index) => (
//                 <li key={index}>
//                   <Link
//                     to={link.href}
//                     className="text-white hover:text-cyan-400 transition text-sm block"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Other Pages Section */}
//           <div>
//             <h3 className="text-xl font-bold mb-4 text-gray-400">
//               Other Pages
//             </h3>
//             <ul className="space-y-2.5">
//               {otherPages.map((link, index) => (
//                 <li key={index}>
//                   <Link
//                     to={link.href}
//                     className="text-white hover:text-cyan-400 transition text-sm block"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Payment Methods Section */}
//           <div>
//             <h3 className="text-lg font-bold mb-4 text-gray-400">
//               Payment Methods
//             </h3>
//             <div className="grid grid-cols-3 gap-3">
//               {/* VISA */}
//               <div className="flex items-center justify-center h-10">
//                 <img
//                   src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
//                   alt="Visa"
//                   className="h-6 object-contain"
//                 />
//               </div>
//               {/* Mastercard */}
//               <div className="flex items-center justify-center h-10">
//                 <img
//                   src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
//                   alt="Mastercard"
//                   className="h-7 object-contain"
//                 />
//               </div>
//               {/* Apple Pay */}
//               <div className="flex items-center justify-center h-10">
//                 <img
//                   src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
//                   alt="Apple Pay"
//                   className="h-6 object-contain brightness-0 invert"
//                 />
//               </div>
//               {/* PayPal */}
//               <div className="flex items-center justify-center h-10">
//                 <img
//                   src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
//                   alt="PayPal"
//                   className="h-6 object-contain"
//                 />
//               </div>
//               {/* MTN MoMo */}
//               <div className="flex items-center justify-center h-10">
//                 <img
//                   src="https://momodeveloper.mtn.com/content/momo_mtna.png"
//                   alt="MTN Mobile Money"
//                   className="h-8 object-contain"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Copyright Section */}
//       <div className="border-t border-white/10">
//         <div className="container mx-auto px-4 py-6">
//           <p className="text-gray-400 text-sm text-center">
//             © FlightBook - all rights reserved
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// src/components/Footer.tsx

import React from "react";
import {
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const pages = [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/support/contact" },
    { label: "FAQ", href: "/support/faq" },
  ];

  const otherPages = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Careers", href: "/careers" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Refund", href: "/refund" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1437] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Contact Us Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Join our happy travellers and find the best accommodation deals
              for you
            </p>

            {/* Socials */}
            <div>
              <h4 className="text-base font-semibold mb-3">Socials</h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com/flightbooking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/flightbooking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
                  aria-label="X (Twitter)"
                >
                  <FaXTwitter className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@flightbooking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-cyan-600 transition"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-green-500 transition"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-400">Pages</h3>
            <ul className="space-y-2.5">
              {pages.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white hover:text-cyan-400 transition text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Pages Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-400">
              Other Pages
            </h3>
            <ul className="space-y-2.5">
              {otherPages.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-white hover:text-cyan-400 transition text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-400">
              Payment Methods
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* VISA */}
              <div className="flex items-center justify-center h-10">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                  alt="Visa"
                  className="h-6 object-contain"
                />
              </div>
              {/* Mastercard */}
              <div className="flex items-center justify-center h-10">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-7 object-contain"
                />
              </div>
              {/* Apple Pay */}
              <div className="flex items-center justify-center h-10">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
                  alt="Apple Pay"
                  className="h-6 object-contain brightness-0 invert"
                />
              </div>
              {/* PayPal */}
              <div className="flex items-center justify-center h-10">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  alt="PayPal"
                  className="h-6 object-contain"
                />
              </div>
              {/* MTN MoMo */}
              <div className="flex items-center justify-center h-10">
                <img
                  src="https://momodeveloper.mtn.com/content/momo_mtna.png"
                  alt="MTN Mobile Money"
                  className="h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-yellow-400 font-bold text-xs">MTN MoMo</span>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} FlightBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

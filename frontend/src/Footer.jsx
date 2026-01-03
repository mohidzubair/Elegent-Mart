import React from "react";
import { Link } from 'react-router-dom';
import martLogo from "../src/assets/Images/martlogo.jpg";


function Footer() {
    return (
        <footer className="bg-[#dc3545] text-white py-10">
            <div className="container mx-auto px-6 md:px-12">
                {/* Flex wrapper */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

                    {/* Logo Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" aria-label="Home">
                            <img
                                src={martLogo}
                                alt="Logo"
                                className="w-32 md:w-44 mb-4 drop-shadow-lg pop-out"
                            />
                        </Link>
                        <p className="text-sm opacity-80">Your trusted shopping partner</p>
                    </div>

                    {/* Contact Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-3">📞 Contact Us</h3>
                        <p className="hover:text-gray-200 transition">
                            WhatsApp: <span className="font-semibold">0300-86899485</span>
                        </p>
                        <p className="hover:text-gray-200 transition">
                            Email: <
                                span className="font-semibold">elegant@gmail.com</span>
                        </p>
                        <p className="hover:text-gray-200 transition">
                            Address: Iqbal Avenue Phase 3, Block C, Elegant Mart
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-3">🔗 Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-gray-200 transition">Home</a></li>
                            <li><a href="#" className="hover:text-gray-200 transition">Products</a></li>
                            <li><a href="#" className="hover:text-gray-200 transition">Categories</a></li>
                            <li><a href="#" className="hover:text-gray-200 transition">Contact</a></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold mb-3">🌐 Follow Us</h3>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a href="#" className="hover:scale-110 transition">
                                <img src="https://img.icons8.com/ios-filled/30/ffffff/facebook-new.png" alt="Facebook" />
                            </a>
                            <a href="#" className="hover:scale-110 transition">
                                <img src="https://img.icons8.com/ios-filled/30/ffffff/instagram-new.png" alt="Instagram" />
                            </a>
                            <a href="#" className="hover:scale-110 transition">
                                <img src="https://img.icons8.com/ios-filled/30/ffffff/twitter.png" alt="Twitter" />
                            </a>
                            <a href="#" className="hover:scale-110 transition">
                                <img src="https://img.icons8.com/ios-filled/30/ffffff/whatsapp.png" alt="WhatsApp" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white mt-10 pt-4 text-center text-sm opacity-80">
                    © 2025 Elegant Mart. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;

import React from 'react';
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-700 z-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Startup Name</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Brief description about what the startup does.</p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 dark:text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Button variant="link" className="dark:text-gray-300">Home</Button></li>
              <li><Button variant="link" className="dark:text-gray-300">Features</Button></li>
              <li><Button variant="link" className="dark:text-gray-300">Pricing</Button></li>
              <li><Button variant="link" className="dark:text-gray-300">Contact</Button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 dark:text-white">Legal</h4>
            <ul className="space-y-2">
              <li><Button variant="link" className="dark:text-gray-300">Terms of Service</Button></li>
              <li><Button variant="link" className="dark:text-gray-300">Privacy Policy</Button></li>
              <li><Button variant="link" className="dark:text-gray-300">Cookie Policy</Button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 dark:text-white">Newsletter</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Stay updated with our latest features and news.</p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Enter your email" className="dark:bg-gray-600 dark:text-white" />
              <Button className="dark:bg-gray-600 dark:text-white">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">&copy; 2024 Ahmad Technologies. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Button variant="ghost" size="icon" className="dark:text-gray-300"><Facebook className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="dark:text-gray-300"><Twitter className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="dark:text-gray-300"><Instagram className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="dark:text-gray-300"><Github className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
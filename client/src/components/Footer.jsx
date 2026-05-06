import { Compass } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-black/[0.06]  bg-white/95">
    <div className="section-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <p className="font-heading text-base font-bold text-ink">TripSync</p>
      </div>
      <div className="flex items-center gap-6 text-sm text-[#6B6780]">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Support</span>
      </div>
      <div className="text-sm text-[#6B6780]">© 2026 TripSync. All rights reserved.</div>
    </div>
  </footer>
);

export default Footer;

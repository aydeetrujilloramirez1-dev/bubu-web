import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

const SOCIALS = [
  { name: "Facebook", url: "https://www.facebook.com/aydee.trujilloramirez.1", Icon: FaFacebookF, hover: "hover:bg-[#1877f2]" },
  { name: "Instagram", url: "https://www.instagram.com/aydee.trujilloramirez.1", Icon: FaInstagram, hover: "hover:bg-[#e1306c]" },
  { name: "TikTok", url: "https://www.tiktok.com/@bubutienda1virtual", Icon: FaTiktok, hover: "hover:bg-black" },
  { name: "YouTube", url: "", Icon: FaYoutube, hover: "hover:bg-[#ff0000]" },
];

export default function Socials({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIALS.filter((s) => s.url).map(({ name, url, Icon, hover }) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className={`grid size-9 place-items-center rounded-full bg-pale text-pink-dark transition hover:text-white ${hover}`}>
          <Icon size={15} />
        </a>
      ))}
    </div>
  );
}
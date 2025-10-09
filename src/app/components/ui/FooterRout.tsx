
import Link from "next/link";
type FooterRoutProps = {
    title: string;
    links: { name: string; href: string }[];

}
export default function FooterRout({ title, links }: FooterRoutProps) {
    return <div>
        <div>
            <h3 className="font-semibold mb-2 text-[#FFFFFF] font-poppins text-[14px]">{title}</h3>
            <ul className="space-y-1">
                {links.map((link, index) => (
                    <li key={index}>
                        <Link href={link.href} className="text-[#FFFFFF] hover:opacity-80 transition-all duration-300 text-[14px]">
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    </div>
}
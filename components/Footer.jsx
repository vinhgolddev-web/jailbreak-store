import Link from 'next/link';
import { Facebook, Youtube, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-surfaceHighlight/30 border-t border-white/5 pt-16 pb-8 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold tracking-tight text-white block">
                                Jailbreak <span className="text-gray-500">Store</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Hệ thống cung cấp vật phẩm game Jailbreak uy tín số 1 Việt Nam. Giao dịch tự động, bảo mật tuyệt đối.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="https://www.facebook.com/vinh.gold.185743" icon={<Facebook size={20} />} label="Facebook" />
                            <SocialLink href="https://www.youtube.com/@VinhGold-x3v9k" icon={<Youtube size={20} />} label="Youtube" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Về Chúng Tôi</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><FooterLink href="/shop">Cửa Hàng</FooterLink></li>
                            <li><FooterLink href="/deposit">Nạp Tiền</FooterLink></li>
                            <li><FooterLink href="#" onClick={(e) => e.preventDefault()}>Điều Khoản Dịch Vụ</FooterLink></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Hỗ Trợ</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><FooterLink href="https://www.facebook.com/vinh.gold.185743">Hướng Dẫn Mua Hàng</FooterLink></li>
                            <li><FooterLink href="https://www.facebook.com/vinh.gold.185743">Liên Hệ Admin</FooterLink></li>
                            <li><FooterLink href="https://www.facebook.com/vinh.gold.185743">Báo Lỗi</FooterLink></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Liên Hệ</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>Hồ Chí Minh,Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span>vinhgold.dev@gmail.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span>034XXXXXXX</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>&copy; 2026 Jailbreak Store. All rights reserved.</p>
                    <p>Designed by <span className="text-white">Vinh Gold</span></p>
                </div>
            </div>
        </footer>
    );
}

const SocialLink = ({ href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black hover:scale-110 transition-all duration-300"
        aria-label={label}
    >
        {icon}
    </a>
);

const FooterLink = ({ href, children, ...props }) => (
    <Link href={href} className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200" {...props}>
        {children}
    </Link>
);

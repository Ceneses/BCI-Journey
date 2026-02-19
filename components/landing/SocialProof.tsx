import React from 'react';
import { Globe } from 'lucide-react';

const schools = [
    "Hangzhou Chongwen Experimental School",
    "Hangzhou Xuejun Wenyuan",
    "Hangzhou Wahaha Bilingual School",
    "Hangzhou Entel Foreign Language School",
    "Hangzhou No.2 High School Qianjiang",
    "Zhejiang Wenling High School",
    "Canada Kent School",
    "Overseas Chinese Academy Suzhou",
    "Britannia International Guangzhou",
    "Foshan No.1 High School"
];

const partners = [
    "Sci2U", "China-Germany Foshan Industry Park", "Brain Research Lab", "ZUST", "ZJU", "Shanghai University", "Suzhou University"
];

const SocialProof: React.FC = () => (
    <section id="schools" className="relative z-10 py-10 border-y border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden">
        <p className="text-center text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">Trusted by Leading Institutions</p>
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {/* Duplicate list for seamless infinite scroll (A, B, A, B) */}
            {[...schools, ...partners, ...schools, ...partners].map((name, i) => (
                <div key={i} className="text-gray-400 font-rajdhani text-lg flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <Globe className="w-4 h-4 text-gray-600" /> {name}
                </div>
            ))}
        </div>
    </section>
);

export default SocialProof;

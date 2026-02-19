import React from 'react';

const faqItems = [
    { q: "What is BCI Journey?", a: "BCI Journey is an interactive educational platform that uses 3D visualization and AI to teach Brain-Computer Interface concepts." },
    { q: "Do I need a VR headset?", a: "No! The experience is fully accessible directly in your web browser on desktop or tablet." },
    { q: "Is it suitable for beginners?", a: "Absolutely. We start with the basics of neuroanatomy and guide you through complex topics step-by-step." },
    { q: "How do I earn Somas?", a: "You earn 17 Million Somas for every 'Activate Neuron' quiz you pass with a perfect score." }
];

const FAQSection: React.FC = () => (
    <section id="faq" className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-12">NEURAL ARCHIVES (FAQ)</h2>

            <div className="space-y-4">
                {faqItems.map((item, i) => (
                    <div key={i} className="border border-white/10 bg-black/40 rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="font-orbitron text-lg text-neon-blue mb-2 flex items-center gap-3">
                                <span className="text-white/50">0{i + 1}.</span> {item.q}
                            </h3>
                            <p className="text-gray-400 font-rajdhani ml-8">{item.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FAQSection;

import React, { useEffect, useRef } from 'react';
import { Shield, Coffee, MapPin, Users, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.reveal', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });

            gsap.from('.feature-card', {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: '.features-grid',
                    start: 'top 80%'
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: <Users size={32} className="text-blue-400" />,
            title: "For Students & Explorers",
            desc: "Find verified PGs, hostels, and mess services near your campus or workplace. Filter by amenities, price, and location ease."
        },
        {
            icon: <Shield size={32} className="text-emerald-400" />,
            title: "Verified Listings",
            desc: "Every listing is vetted for quality and safety. We prioritize your peace of mind so you can focus on what matters."
        },
        {
            icon: <Coffee size={32} className="text-orange-400" />,
            title: "Food & Dining",
            desc: "Not just rooms – discover hidden culinary gems. From budget friendly mess to premium dining experiences."
        },
        {
            icon: <MapPin size={32} className="text-purple-400" />,
            title: "Smart Location Search",
            desc: "Search by city, area, or college. Our smart filters help you find exactly what you need, right where you need it."
        }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Hero Section */}
            <div className="relative py-24 px-4 text-center">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="reveal text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                        About Room & Food Finder
                    </h1>
                    <p className="reveal text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        We are building the ultimate ecosystem for students and professionals to find comfortable living spaces and delicious food, hassle-free.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 pb-24">
                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="reveal flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-bold">Our Mission</h2>
                            <p className="text-lg text-muted-foreground">
                                Moving to a new city is hard. Finding a place to call home shouldn't be.
                                We realized that the fragmented market of PGs, hostels, and tiffin services needed a unified,
                                transparent, and modern platform.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Whether you are a student exploring a new campus life or a professional relocating for work,
                                Room & Food Finder is your trusted companion.
                            </p>
                            <div className="pt-4">
                                <Link to="/explore" className="btn btn-primary rounded-full px-8 py-3 inline-flex items-center gap-2">
                                    Start Exploring <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative h-[400px] rounded-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
                                alt="Team working"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-6 left-6 z-20 text-white">
                                <span className="text-sm font-uppercase tracking-widest opacity-80">EST. 2024</span>
                                <h3 className="text-2xl font-bold">Connecting People & Places</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-24 features-grid">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="feature-card glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group">
                            <div className="mb-4 p-3 bg-secondary/50 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Join Community Section */}
            <div className="bg-primary/5 py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
                    <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                        We are more than just a platform; we are a community of students, professionals, and property owners working together.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-500 mb-2">1,200+</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Verified Listings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Cities Covered</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Have Questions?</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Whether you need help finding a room or want to list your property, our support team is here for you 24/7.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <a href="mailto:support@roomfoodfinder.com" className="btn btn-primary rounded-full px-8 py-3">
                            Email Support
                        </a>
                        <a href="tel:+1234567890" className="btn btn-outline rounded-full px-8 py-3">
                            Call Us: +91 98765 43210
                        </a>
                    </div>
                </div>
            </div>

            <footer className="border-t border-border/40 py-12 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Room & Food Finder. Made with <span className="text-red-500">❤</span> for explorers.</p>
            </footer>
        </div>
    );
};

export default AboutPage;

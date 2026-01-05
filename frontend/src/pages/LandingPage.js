import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, MapPin, Coffee, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const mainRef = useRef(null);
    const marqueeRef = useRef(null);
    const horizontalSectionRef = useRef(null);
    const resizeHandlerRef = useRef(null);

    useLayoutEffect(() => {
        // --- 1. Initialize Lenis Smooth Scroll ---
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out custom
            smooth: true,
            smoothTouch: false,
        });

        // Sync Lenis and ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            // --- 2. Hero Scale-Down Effect ---
            gsap.fromTo('.hero-section',
                { scale: 1.05 },
                {
                    scale: 1.0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero-section',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );

            // --- 3. Hero Text Staggered Reveal ---
            const heroElements = ['.hero-reveal', '.hero-fade'];
            gsap.fromTo(heroElements,
                { y: 80, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.8,
                    stagger: 0.15,
                    ease: 'power4.out',
                    delay: 0.2
                }
            );

            // --- 4. Infinite Velocity Marquee ---
            let xPercent = 0;
            let direction = -1;
            const marqueeText = gsap.utils.toArray('.marquee-text');

            const animateMarquee = () => {
                if (xPercent <= -100) xPercent = 0;
                if (xPercent > 0) xPercent = -100;
                gsap.set(marqueeText, { xPercent: xPercent });
                xPercent += 0.05 * direction;
                requestAnimationFrame(animateMarquee);
            };
            requestAnimationFrame(animateMarquee);

            // Marquee Speed Boost on Scroll
            gsap.to(marqueeRef.current, {
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: 0,
                    end: 'bottom bottom',
                    onUpdate: e => {
                        direction = e.direction * -1;
                        xPercent += e.getVelocity() * 0.0005 * direction;
                    }
                }
            });

            // --- 5. Global Section Reveal ---
            // Any section following the hero gets a reveal animation
            const sections = gsap.utils.toArray('section:not(.hero-section)');
            sections.forEach(section => {
                gsap.fromTo(section,
                    { y: 80, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.5,
                        ease: 'power4.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 85%',
                        }
                    }
                );
            });

            // --- 6. Horizontal Scroll Animation ---
            const track = horizontalSectionRef.current?.querySelector('.flex');
            
            if (track) {
                const calculateScroll = () => {
                    // Get all cards
                    const cards = track.children;
                    if (cards.length === 0) return;
                    
                    // Reset position first
                    gsap.set(track, { x: 0 });
                    
                    // Calculate the total width of all cards including gaps
                    const cardWidth = cards[0].offsetWidth;
                    const gap = 48; // gap-12 = 3rem = 48px
                    const totalContentWidth = (cardWidth * cards.length) + (gap * (cards.length - 1)) + 48; // +48 for left padding
                    const viewportWidth = window.innerWidth;
                    
                    // Calculate scroll distance - only scroll what's needed to show the last card
                    const scrollDistance = Math.max(0, totalContentWidth - viewportWidth);
                    
                    if (scrollDistance > 0) {
                        gsap.to(track, {
                            x: () => -scrollDistance,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: horizontalSectionRef.current,
                                start: 'top top',
                                end: () => `+=${scrollDistance}`,
                                scrub: 0.3,
                                pin: true,
                                anticipatePin: 1,
                                invalidateOnRefresh: true,
                                onUpdate: (self) => {
                                    // Clamp values to prevent overscroll
                                    if (self.progress < 0) self.progress = 0;
                                    if (self.progress > 1) self.progress = 1;
                                }
                            }
                        });
                    }
                };
                
                // Use requestAnimationFrame to ensure layout is ready
                requestAnimationFrame(() => {
                    requestAnimationFrame(calculateScroll);
                });
                
                // Handle resize with debounce
                let resizeTimeout;
                resizeHandlerRef.current = () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        calculateScroll();
                    }, 150);
                };
                window.addEventListener('resize', resizeHandlerRef.current);
            }

            // --- 7. Parallax Blobs ---
            gsap.to('.hero-bg-blob', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // --- 8. Magnetic Buttons ---
            const magneticBtns = document.querySelectorAll('.magnetic-btn');
            magneticBtns.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const bound = btn.getBoundingClientRect();
                    const x = (e.clientX - bound.left - bound.width / 2) * 0.4;
                    const y = (e.clientY - bound.top - bound.height / 2) * 0.4;
                    gsap.to(btn, { x: x, y: y, duration: 0.3, ease: 'power2.out' });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
                });
            });

        }, mainRef);

        return () => {
            lenis.destroy();
            ctx.revert();
            gsap.ticker.remove(lenis.raf);
            // Cleanup resize handler if it exists
            if (resizeHandlerRef.current) {
                window.removeEventListener('resize', resizeHandlerRef.current);
                resizeHandlerRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={mainRef} className="bg-background min-h-screen overflow-x-hidden selection:bg-primary selection:text-white dark:text-white">

            {/* Hero Section */}
            <section className="hero-section relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="hero-bg-blob absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="hero-bg-blob absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto space-y-2">
                    <div className="overflow-hidden">
                        <h1 className="hero-reveal hero-text-1 text-[12vw] leading-[0.85] font-bold tracking-tighter text-foreground uppercase drop-shadow-xl dark:drop-shadow-none">
                            Room &
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="hero-reveal hero-text-2 text-[12vw] leading-[0.85] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 uppercase drop-shadow-xl">
                            Food Finder
                        </h1>
                    </div>

                    <p className="hero-fade text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto font-light pt-8 leading-relaxed">
                        Curated spaces and dining experiences for the modern explorer.
                    </p>

                    <div className="hero-fade pt-10">
                        <Link to="/explore" className="magnetic-btn inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-full font-bold text-lg hover:bg-foreground/90 transition-colors">
                            Start Exploring
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marquee Section */}
            <div className="py-12 border-y border-white/5 bg-background overflow-hidden relative z-20">
                <div ref={marqueeRef} className="relative flex whitespace-nowrap overflow-hidden">
                    <div className="marquee-text flex gap-8 items-center text-8xl font-bold px-4 text-foreground/20 dark:text-foreground/40">
                        <span className="stroke-text">LIFESTYLE</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">COMFORT</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">LUXURY</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">DINING</span>
                        <span className="text-primary text-4xl">●</span>
                    </div>
                    <div className="marquee-text flex gap-8 items-center text-8xl font-bold px-4 text-foreground/20 dark:text-foreground/40">
                        <span className="stroke-text">LIFESTYLE</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">COMFORT</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">LUXURY</span>
                        <span className="text-primary text-4xl">●</span>
                        <span className="stroke-text">DINING</span>
                        <span className="text-primary text-4xl">●</span>
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Features */}
            <section ref={horizontalSectionRef} className="h-screen relative flex items-center overflow-hidden bg-background">
                <div className="absolute top-12 left-12 z-20">
                    <h2 className="text-4xl font-bold">Why Choose Us?</h2>
                    <p className="text-muted-foreground">Swipe to discover</p>
                </div>

                <div className="flex flex-nowrap h-full items-center pl-12 pr-0 gap-12 pt-24">

                    {/* Card 1 */}
                    <div className="h-item w-[80vw] md:w-[600px] h-[70vh] flex-shrink-0 relative group rounded-[2.5rem] overflow-hidden border border-white/10 bg-secondary/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2669&auto=format&fit=crop"
                            alt="Interior"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-0 left-0 p-10 z-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/20">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-4">Prime Locations</h3>
                            <p className="text-white/70 text-lg leading-relaxed max-w-md">
                                Living spaces in the heart of the city. We select locations that minimize commute and maximize life.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="h-item w-[80vw] md:w-[600px] h-[70vh] flex-shrink-0 relative group rounded-[2.5rem] overflow-hidden border border-white/10 bg-secondary/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2600&auto=format&fit=crop"
                            alt="Food"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-0 left-0 p-10 z-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/20">
                                <Coffee size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-4">Gourmet Dining</h3>
                            <p className="text-white/70 text-lg leading-relaxed max-w-md">
                                Discover hidden gems and top-rated restaurants. Your guide to the best culinary experiences around.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="h-item w-[80vw] md:w-[600px] h-[70vh] flex-shrink-0 relative group rounded-[2.5rem] overflow-hidden border border-white/10 bg-secondary/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1626178793926-22b28d304710?q=80&w=2670&auto=format&fit=crop"
                            alt="Trust"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-0 left-0 p-10 z-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 text-white border border-white/20">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-4">Verified & Safe</h3>
                            <p className="text-white/70 text-lg leading-relaxed max-w-md">
                                Every listing is vetted. We prioritize your safety and peace of mind above all else.
                            </p>
                        </div>
                    </div>

                </div>
            </section >

            {/* Final CTA */}
            <section className="relative py-32 flex flex-col justify-center items-center text-center px-4 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12 relative z-10">
                    Ready to Dive In?
                </h2>
                <Link to="/register" className="magnetic-btn relative px-12 py-6 bg-primary text-primary-foreground text-xl font-bold rounded-full overflow-hidden group z-10">
                    <span className="relative z-10">Get Started Now</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
            </section>

            <footer className="border-t border-border/40 py-12 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Room & Food Finder.</p>
            </footer>
        </div >
    );
};

export default LandingPage;

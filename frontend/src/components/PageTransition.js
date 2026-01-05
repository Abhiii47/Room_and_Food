import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './PageTransition.css';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Page enter animation
        gsap.fromTo(
            container,
            {
                opacity: 0,
                y: 20,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
            }
        );
    }, [location]);

    return (
        <div ref={containerRef} className="page-transition">
            {children}
        </div>
    );
};

export default PageTransition;

// Smooth scroll behavior and interactive enhancements
document.addEventListener('DOMContentLoaded', function() {
    
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .form-wrapper');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Smooth scroll to form when clicking on stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('click', () => {
            const formSection = document.querySelector('.form-section');
            formSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.stat, .feature-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });

    // Add loading animation for iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            iframe.style.opacity = '1';
            iframe.style.transform = 'scale(1)';
        });
        
        // Initial state
        iframe.style.opacity = '0';
        iframe.style.transform = 'scale(0.95)';
        iframe.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    // Add typing effect to hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.borderRight = '2px solid #ffd700';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                heroSubtitle.style.borderRight = 'none';
            }
        };
        
        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }

    // Add floating animation to logo icon
    const logoIcon = document.querySelector('.logo i');
    if (logoIcon) {
        logoIcon.style.animation = 'pulse 2s infinite, float 3s ease-in-out infinite';
    }

    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
        }
    `;
    document.head.appendChild(style);

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #ffd700, #ffed4e);
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add mobile menu toggle (if needed in future)
    const addMobileMenu = () => {
        const header = document.querySelector('.hero');
        if (header && window.innerWidth <= 768) {
            // Add mobile-specific features here if needed
        }
    };

    // Call on load and resize
    addMobileMenu();
    window.addEventListener('resize', addMobileMenu);

    // Add form submission tracking
    if (iframe) {
        iframe.addEventListener('load', () => {
            // Track when form is loaded
            console.log('Tally form loaded successfully');
        });
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement.classList.contains('stat')) {
            document.activeElement.click();
        }
    });

    // Add focus styles for accessibility
    const focusableElements = document.querySelectorAll('a, button, .stat, .feature-card');
    focusableElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid #ffd700';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Add loading state
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // Add CSS for loaded state
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body.loaded .hero-content {
            animation: fadeInUp 1s ease-out;
        }
    `;
    document.head.appendChild(loadedStyle);

    console.log('BINGG CHILLIN website loaded successfully! 🎉');
}); 
// Futuristic dark theme interactions and animations
document.addEventListener('DOMContentLoaded', function() {
    
    // Add scroll-triggered animations with enhanced effects
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .form-wrapper, .stat');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Enhanced parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const backgroundElements = document.querySelector('.background-elements');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        if (backgroundElements) {
            backgroundElements.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });

    // Enhanced smooth scroll to form when clicking on stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('click', () => {
            const formSection = document.querySelector('.form-section');
            formSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add click effect
            stat.style.transform = 'scale(0.95)';
            setTimeout(() => {
                stat.style.transform = '';
            }, 150);
        });
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.stat, .feature-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.transform = this.style.transform + ' scale(1.02)';
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace(' scale(1.02)', '');
        });
    });

    // Enhanced loading animation for iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            iframe.style.opacity = '1';
            iframe.style.transform = 'scale(1)';
            iframe.style.filter = 'brightness(1)';
        });
        
        // Initial state
        iframe.style.opacity = '0';
        iframe.style.transform = 'scale(0.95)';
        iframe.style.filter = 'brightness(0.8)';
        iframe.style.transition = 'opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease';
    }

    // Enhanced typing effect to hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.borderRight = '2px solid #ff6b35';
        heroSubtitle.style.animation = 'blink 1s infinite';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 60);
            } else {
                heroSubtitle.style.borderRight = 'none';
                heroSubtitle.style.animation = 'none';
            }
        };
        
        // Start typing effect after a delay
        setTimeout(typeWriter, 1500);
    }

    // Add floating animation to background elements
    const floatingElements = document.querySelectorAll('.glow-orange, .glow-blue, .glow-yellow, .shape');
    floatingElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.5}s`;
    });

    // Add CSS for enhanced animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { border-color: #ff6b35; }
            51%, 100% { border-color: transparent; }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(1deg); }
            66% { transform: translateY(10px) rotate(-1deg); }
        }
        
        @keyframes glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out;
        }
        
        .glow-orange, .glow-blue, .glow-yellow {
            animation: float 6s ease-in-out infinite, glow 4s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);

    // Enhanced scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #ff6b35, #f7931e);
        z-index: 1000;
        transition: width 0.1s ease;
        box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add mouse trail effect
    let mouseTrail = [];
    const maxTrailLength = 20;
    
    document.addEventListener('mousemove', (e) => {
        mouseTrail.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
        
        if (mouseTrail.length > maxTrailLength) {
            mouseTrail.shift();
        }
        
        // Remove old trail points
        mouseTrail = mouseTrail.filter(point => Date.now() - point.timestamp < 1000);
    });

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
            this.style.outline = '2px solid #ff6b35';
            this.style.outlineOffset = '2px';
            this.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.3)';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
            this.style.boxShadow = '';
        });
    });

    // Add loading state with enhanced effects
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Add entrance animation to main title
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) {
            mainTitle.style.animation = 'fadeInUp 1.5s ease-out';
        }
    });

    // Add CSS for loaded state
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body.loaded .hero-content {
            animation: fadeInUp 1.5s ease-out;
        }
        
        .main-title .title-large {
            animation: fadeInUp 1.5s ease-out;
        }
        
        .main-title .title-large:nth-child(2) {
            animation-delay: 0.2s;
        }
    `;
    document.head.appendChild(loadedStyle);

    // Add particle effect to background
    const addParticles = () => {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 107, 53, 0.3);
                border-radius: 50%;
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
            `;
            particleContainer.appendChild(particle);
        }
    };

    // Initialize particles after a delay
    setTimeout(addParticles, 1000);

    // Add form submission tracking
    if (iframe) {
        iframe.addEventListener('load', () => {
            console.log('Tally form loaded successfully');
        });
    }

    console.log('BINGG CHILLIN futuristic website loaded successfully! 🚀');
}); 
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const menuToggleButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav a');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ------------------------------
    // Helpers
    // ------------------------------
    const getHeaderHeight = () => (header ? header.offsetHeight : 0);

    const setHeaderHeightCSSVar = () => {
        const root = document.documentElement;
        root.style.setProperty('--header-height', `${getHeaderHeight()}px`);
    };

    const debounce = (fn, wait = 150) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(null, args), wait);
        };
    };

    const smoothScrollTo = (targetElement) => {
        if (!targetElement) return;
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
        if (prefersReducedMotion) {
            window.scrollTo(0, Math.max(0, y));
            return;
        }
        try {
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        } catch (_) {
            window.scrollTo(0, Math.max(0, y));
        }
    };

    // Sync header height CSS var on load and resize
    setHeaderHeightCSSVar();
    window.addEventListener('resize', debounce(setHeaderHeightCSSVar, 150), { passive: true });

    // ------------------------------
    // Mobile menu with accessibility
    // ------------------------------
    if (menuToggleButton && navigation) {
        // Ensure navigation has an id for aria-controls
        if (!navigation.id) navigation.id = 'primary-navigation';
        menuToggleButton.setAttribute('aria-controls', navigation.id);
        menuToggleButton.setAttribute('aria-expanded', 'false');
        let isMenuOpen = false;

        const closeMenu = () => {
            if (!isMenuOpen) return;
            isMenuOpen = false;
            menuToggleButton.classList.remove('active');
            navigation.classList.remove('active');
            menuToggleButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        const openMenu = () => {
            if (isMenuOpen) return;
            isMenuOpen = true;
            menuToggleButton.classList.add('active');
            navigation.classList.add('active');
            menuToggleButton.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        const toggleMenu = () => (isMenuOpen ? closeMenu() : openMenu());

        menuToggleButton.addEventListener('click', toggleMenu);

        // Close on outside click
        document.addEventListener('click', (event) => {
            if (!isMenuOpen) return;
            const target = event.target;
            if (!navigation.contains(target) && target !== menuToggleButton) {
                closeMenu();
            }
        });

        // Close with Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMenu();
        });

        // Close when a nav link is activated
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (isMenuOpen) closeMenu();
            });
        });
    }

    // ------------------------------
    // Smooth in-page anchors respecting header height
    // ------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const targetElement = document.querySelector(href);
            if (!targetElement) return;
            event.preventDefault();
            smoothScrollTo(targetElement);
        });
    });

    // Fix initial hash navigation with header offset
    if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) setTimeout(() => smoothScrollTo(target), 0);
    }

    // ------------------------------
    // Header hide/show on scroll (rAF throttled)
    // ------------------------------
    if (header) {
        let lastScrollY = window.pageYOffset;
        let ticking = false;

        const updateHeaderOnScroll = () => {
            const currentY = window.pageYOffset;
            if (currentY <= 0) {
                header.classList.remove('scroll-up');
                header.classList.remove('scroll-down');
            } else if (currentY > lastScrollY) {
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (currentY < lastScrollY) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            lastScrollY = currentY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderOnScroll);
                ticking = true;
            }
        }, { passive: true });
    }

    // ------------------------------
    // Reveal on scroll (IntersectionObserver with fallback)
    // ------------------------------
    const revealSelector = '.pillar, .research-highlights article, .team-member';
    const revealElements = document.querySelectorAll(revealSelector);

    if (revealElements.length) {
        // Initial state
        revealElements.forEach((element) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        if (prefersReducedMotion) {
            revealElements.forEach((element) => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
        } else if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                        obs.unobserve(el);
                    }
                });
            }, { threshold: 0.15 });

            revealElements.forEach((el) => observer.observe(el));
        } else {
            // Fallback
            const onScrollFallback = () => {
                const viewportTrigger = window.innerHeight / 1.15;
                revealElements.forEach((element) => {
                    const top = element.getBoundingClientRect().top;
                    if (top < viewportTrigger) {
                        element.style.opacity = '1';
                        element.style.transform = 'none';
                    }
                });
            };
            window.addEventListener('scroll', onScrollFallback, { passive: true });
            onScrollFallback();
        }
    }

    // ------------------------------
    // Articles loading (simulation with loader)
    // ------------------------------
    if (document.querySelector('.articles-container')) {
        fetchArticles();
    }

    // ------------------------------
    // Contact form validation
    // ------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const message = String(formData.get('message') || '').trim();

            const emailIsValid = /.+@.+\..+/.test(email);
            if (!name || !email || !message) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (!emailIsValid) {
                alert('Por favor, informe um e-mail válido.');
                return;
            }

            console.log('Formulário enviado:', { name, email, message });
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            contactForm.reset();
        });
    }
});

// Função para simular carregamento de artigos (seria substituída por uma chamada real à API)
function fetchArticles() {
    const container = document.querySelector('.articles-container');
    if (!container) return;

    // Loading placeholder
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.innerHTML = '<i class="icon-spinner"></i> Carregando artigos...';
    container.innerHTML = '';
    container.appendChild(loadingEl);

    // Simular delay de rede
    setTimeout(() => {
        const articles = [
            {
                title: 'A Importância da Comunicação em Cuidados Paliativos',
                excerpt: 'Como a comunicação efetiva pode melhorar a qualidade do cuidado ao paciente terminal.',
                date: '15/10/2025',
                link: '#'
            },
            {
                title: 'Manejo da Dor em Pacientes Oncológicos',
                excerpt: 'Estratégias baseadas em evidências para o controle da dor em cuidados paliativos.',
                date: '02/09/2025',
                link: '#'
            },
            {
                title: 'Suporte à Família no Processo de Luto',
                excerpt: 'O papel da enfermagem no acompanhamento dos familiares durante e após o processo de morte.',
                date: '20/07/2025',
                link: '#'
            }
        ];

        container.innerHTML = articles.map((article) => `
            <article class="article-card">
                <h3>${article.title}</h3>
                <p class="article-date">${article.date}</p>
                <p class="article-excerpt">${article.excerpt}</p>
                <a href="${article.link}" class="btn btn-outline">Ler mais</a>
            </article>
        `).join('');
    }, 800);
}

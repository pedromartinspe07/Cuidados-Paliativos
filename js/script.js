document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
        
        // Acessibilidade
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Efeito de scroll para o header
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
    
    // Animação de elementos quando entram na viewport
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.pillar, .research-highlights article, .team-member');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Definir propriedades iniciais para animação
    const animatedElements = document.querySelectorAll('.pillar, .research-highlights article, .team-member');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Executar uma vez ao carregar a página
    
    // Carregamento de artigos (simulação)
    if (document.querySelector('.articles-container')) {
        fetchArticles();
    }
    
    // Formulário de contato
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Validação simples
            if (!name || !email || !message) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            // Simular envio
            console.log('Formulário enviado:', { name, email, message });
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            this.reset();
        });
    }
});

// Função para simular carregamento de artigos (seria substituída por uma chamada real à API)
function fetchArticles() {
    // Simular delay de rede
    setTimeout(() => {
        const articles = [
            {
                title: "A Importância da Comunicação em Cuidados Paliativos",
                excerpt: "Como a comunicação efetiva pode melhorar a qualidade do cuidado ao paciente terminal.",
                date: "15/10/2025",
                link: "#"
            },
            {
                title: "Manejo da Dor em Pacientes Oncológicos",
                excerpt: "Estratégias baseadas em evidências para o controle da dor em cuidados paliativos.",
                date: "02/09/2025",
                link: "#"
            },
            {
                title: "Suporte à Família no Processo de Luto",
                excerpt: "O papel da enfermagem no acompanhamento dos familiares durante e após o processo de morte.",
                date: "20/07/2025",
                link: "#"
            }
        ];
        
        const container = document.querySelector('.articles-container');
        if (container) {
            container.innerHTML = articles.map(article => `
                <article class="article-card">
                    <h3>${article.title}</h3>
                    <p class="article-date">${article.date}</p>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <a href="${article.link}" class="btn btn-outline">Ler mais</a>
                </article>
            `).join('');
        }
    }, 800);
}

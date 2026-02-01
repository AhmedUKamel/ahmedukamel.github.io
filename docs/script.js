// Data Loading and Rendering Functions
let portfolioData = null;

// Load portfolio data from JSON
async function loadPortfolioData() {
    try {
        const response = await fetch('database.json');
        portfolioData = await response.json();
        renderPortfolio();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Fallback to existing static content if JSON fails to load
    }
}

// Render all portfolio sections
function renderPortfolio() {
    if (!portfolioData) return;
    
    updateSEO();
    renderNavigation();
    renderHeroSection();
    renderAboutSection();
    renderExperienceSection();
    renderEducationSection();
    renderSkillsSection();
    renderProjectsSection();
    renderReachMeSection();
    renderContactSection();
    renderFooter();
    
    // Initialize typing effect after content is loaded
    initTypingEffect();
}

// Update SEO meta tags
function updateSEO() {
    const { seo } = portfolioData;
    document.getElementById('page-title').textContent = seo.title;
    document.getElementById('meta-description').setAttribute('content', seo.description);
    document.getElementById('meta-keywords').setAttribute('content', seo.keywords.join(', '));
    document.getElementById('meta-author').setAttribute('content', seo.author);
}

// Render navigation
function renderNavigation() {
    const navMenu = document.getElementById('nav-menu');
    const navBrandName = document.getElementById('nav-brand-name');
    
    navBrandName.textContent = portfolioData.personal.name;
    
    // Generate navigation items based on existing sections with headings
    const sections = document.querySelectorAll('section[id]');
    const dynamicNavItems = [];
    
    sections.forEach(section => {
        const sectionTitle = section.querySelector('.section-title, h1, h2, h3');
        if (sectionTitle) {
            const existingItem = portfolioData.navigation.find(item => item.href === `#${section.id}`);
            if (existingItem) {
                // Update existing item with actual heading text
                existingItem.name = sectionTitle.textContent.trim();
            } else {
                // Add new item for sections not in the original navigation
                dynamicNavItems.push({
                    name: sectionTitle.textContent.trim(),
                    href: `#${section.id}`
                });
            }
        }
    });
    
    // Combine original navigation with dynamic items
    const allNavItems = [...portfolioData.navigation, ...dynamicNavItems];
    
    navMenu.innerHTML = allNavItems.map(item => `
        <li><a href="${item.href}" class="nav-link" data-section="${item.href.substring(1)}">${item.name}</a></li>
    `).join('');
}

// Render hero section
function renderHeroSection() {
    const { personal } = portfolioData;
    // Don't set the name here - let the typing effect handle it
    document.getElementById('hero-title').textContent = personal.title;
    document.getElementById('hero-tagline').textContent = personal.tagline;
    document.getElementById('hero-github').href = personal.github;
}

// Render about section
function renderAboutSection() {
    const { personal, stats } = portfolioData;
    document.getElementById('about-description').textContent = personal.about;
    document.getElementById('about-extended').textContent = personal.aboutExtended;
    
    const aboutStats = document.getElementById('about-stats');
    aboutStats.innerHTML = stats.map(stat => `
        <div class="stat-item">
            <h3>${stat.number}</h3>
            <p>${stat.label}</p>
        </div>
    `).join('');
}

// Render experience section
function renderExperienceSection() {
    const experienceTimeline = document.getElementById('experience-timeline');
    
    // Group experiences by year for timeline markers
    const experiencesByYear = {};
    portfolioData.experience.forEach(exp => {
        const year = new Date(exp.starts).getFullYear();
        if (!experiencesByYear[year]) {
            experiencesByYear[year] = [];
        }
        experiencesByYear[year].push(exp);
    });
    
    let timelineHTML = '';
    const sortedYears = Object.keys(experiencesByYear).sort((a, b) => b - a); // Sort descending (newest first)
    
    sortedYears.forEach((year, yearIndex) => {
        // Sort experiences within the year by start date (newest first)
        const sortedExperiencesInYear = experiencesByYear[year].sort((a, b) => new Date(b.starts) - new Date(a.starts));
        
        // Add experiences for this year
        sortedExperiencesInYear.forEach((exp, expIndex) => {
            const showYear = expIndex === 0; // Show year only for the first experience of each year
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-dot ${exp.current ? 'current' : ''}"></div>
                    ${showYear ? `<div class="timeline-year">${year}</div>` : ''}
                    <div class="timeline-content">
                        <div class="experience-header">
                            <div class="experience-logo">
                                ${exp.companyLogo ? 
                                    `<img src="${exp.companyLogo}" alt="${exp.company} logo" onerror="this.parentElement.innerHTML='<div class=\'fallback-logo\'>${exp.company.charAt(0)}</div>'" />` : 
                                    `<div class="fallback-logo">${exp.company.charAt(0)}</div>`
                                }
                            </div>
                            <div class="experience-title-section">
                                <h3>${exp.position}</h3>
                                <div class="experience-meta">
                                    ${exp.companyWebsite ? `<a href="${exp.companyWebsite}" target="_blank" class="experience-company-link" title="Visit ${exp.company} website"><span class="experience-company">${exp.company}</span><i class="fas fa-external-link-alt"></i></a>` : `<span class="experience-company">${exp.company}</span>`}
                                    ${exp.location ? `<span class="experience-location">${exp.location}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="experience-details">
                            <div class="experience-timeline-info">
                                <span class="experience-duration">${formatExperienceDateRange(exp.starts, exp.ends, exp.current)}</span>
                                <span class="experience-type">${exp.type}</span>
                                ${exp.current ? '<span class="experience-current">Current</span>' : ''}
                            </div>
                            ${exp.description ? `<p class="experience-description">${exp.description}</p>` : ''}
                            ${exp.achievements && exp.achievements.length > 0 ? `
                                <div class="experience-achievements">
                                    <h5>Key Achievements:</h5>
                                    <ul>
                                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${exp.technologies && exp.technologies.length > 0 ? `
                                <div class="experience-technologies">
                                    ${exp.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    });
    
    experienceTimeline.innerHTML = timelineHTML;
}

// Helper function to format date ranges
function formatDateRange(startDate, endDate) {
    const options = { year: 'numeric', month: 'short' };
    const start = new Date(startDate).toLocaleDateString('en-US', options);
    const end = new Date(endDate).toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
}

// Helper function to format experience date ranges
function formatExperienceDateRange(startDate, endDate, current) {
    const options = { year: 'numeric', month: 'short' };
    const start = new Date(startDate).toLocaleDateString('en-US', options);
    
    if (current || !endDate) {
        return `${start} - Present`;
    }
    
    const end = new Date(endDate).toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
}

// Helper function to format education date ranges
function formatEducationDateRange(startDate, endDate, current) {
    const options = { year: 'numeric', month: 'short' };
    const start = new Date(startDate).toLocaleDateString('en-US', options);
    
    if (current || !endDate) {
        return `${start} - Present`;
    }
    
    const end = new Date(endDate).toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
}

// Render education section
function renderEducationSection() {
    const educationContainer = document.getElementById('education-container');
    
    // Group education by year for timeline markers
    const educationByYear = {};
    portfolioData.education.forEach(edu => {
        const year = new Date(edu.starts).getFullYear();
        if (!educationByYear[year]) {
            educationByYear[year] = [];
        }
        educationByYear[year].push(edu);
    });
    
    let timelineHTML = '';
    const sortedYears = Object.keys(educationByYear).sort((a, b) => b - a); // Sort descending (newest first)
    
    sortedYears.forEach((year, yearIndex) => {
        // Add education for this year
        educationByYear[year].forEach((edu, eduIndex) => {
            const showYear = eduIndex === 0; // Show year only for the first education of each year
            timelineHTML += `
                <div class="education-timeline-item">
                    <div class="education-timeline-dot ${edu.current ? 'current' : ''}"></div>
                    ${showYear ? `<div class="education-timeline-year">${year}</div>` : ''}
                    <div class="education-timeline-content">
                        <div class="education-header">
                            <div class="education-logo">
                                ${edu.institutionLogo ? 
                                    `<img src="${edu.institutionLogo}" alt="${edu.institution} logo" onerror="this.parentElement.innerHTML='<div class=\'fallback-logo\'>${edu.institution.split(' ')[0].charAt(0)}</div>'" />` : 
                                    `<div class="fallback-logo">${edu.institution.split(' ')[0].charAt(0)}</div>`
                                }
                            </div>
                            <div class="education-title-section">
                                <h3>${edu.degree}${edu.specialization ? ` in ${edu.specialization}` : ''}</h3>
                                <div class="education-meta">
                                    ${edu.institutionWebsite ? `<a href="${edu.institutionWebsite}" target="_blank" class="education-institution-link" title="Visit ${edu.institution} website"><span class="education-institution">${edu.institution}</span><i class="fas fa-external-link-alt"></i></a>` : `<span class="education-institution">${edu.institution}</span>`}
                                    ${edu.location ? `<span class="education-location">${edu.location}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="education-details">
                            <div class="education-timeline-info">
                                <span class="education-duration">${formatEducationDateRange(edu.starts, edu.ends, edu.current)}</span>
                                ${edu.grade ? `<span class="education-grade">${edu.grade}</span>` : ''}
                                ${edu.gpa ? `<span class="education-gpa">GPA: ${edu.gpa}</span>` : ''}
                                ${edu.current ? '<span class="education-current">Current</span>' : ''}
                            </div>
                            ${edu.description ? `<p class="education-description">${edu.description}</p>` : ''}
                            ${edu.highlights && edu.highlights.length > 0 ? `
                                <div class="education-highlights">
                                    ${edu.highlights.map(highlight => `<span class="highlight-badge">${highlight}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    });
    
    educationContainer.innerHTML = timelineHTML;
}

// Render skills section
function renderSkillsSection() {
    const skillsGrid = document.getElementById('skills-grid');
    skillsGrid.innerHTML = portfolioData.skills.categories.map(category => {
        if (category.type === 'progress') {
            return `
                <div class="skill-category">
                    <h3>${category.name}</h3>
                    <div class="skill-items">
                        ${category.skills.map(skill => `
                            <div class="skill-item" data-level="${skill.level}">
                                <span class="skill-name">${skill.name}</span>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (category.type === 'badges') {
            return `
                <div class="skill-category">
                    <h3>${category.name}</h3>
                    <div class="skill-badges">
                        ${category.skills.map(skill => `
                            <span class="badge">${skill.name}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Render projects section
function renderProjectsSection() {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Sort projects by order field (ascending)
    const sortedProjects = [...portfolioData.projects].sort((a, b) => {
        const orderA = a.order || 999; // Default to 999 if no order specified
        const orderB = b.order || 999;
        return orderA - orderB;
    });
    
    projectsGrid.innerHTML = sortedProjects.map(project => `
        <div class="project-card">
            ${project.logo ? `
                <div class="project-logo">
                    <img src="${project.logo}" alt="${project.title} logo" onerror="this.parentElement.remove()">
                </div>
            ` : ''}
            <div class="project-links">
                ${project.links.github ? `
                    <a href="${project.links.github}" target="_blank" class="project-link" title="GitHub Repository">
                        <i class="fab fa-github"></i>
                    </a>
                ` : ''}
                ${project.links.live ? `
                    <a href="${project.links.live}" target="_blank" class="project-link" title="Live Demo">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
                ${project.links.facebook ? `
                    <a href="${project.links.facebook}" target="_blank" class="project-link" title="Facebook Page">
                        <i class="fab fa-facebook"></i>
                    </a>
                ` : ''}
                ${project.links.googlePlay ? `
                    <a href="${project.links.googlePlay}" target="_blank" class="project-link" title="Google Play Store">
                        <i class="fab fa-google-play"></i>
                    </a>
                ` : ''}
                ${project.links.appStore ? `
                    <a href="${project.links.appStore}" target="_blank" class="project-link" title="Apple App Store">
                        <i class="fab fa-app-store-ios"></i>
                    </a>
                ` : ''}
            </div>
            <div class="project-title-section">
                <h3>${project.title}</h3>
                <div class="project-meta">
                    ${project.types && project.types.length > 0 ? `
                        <div class="project-types">
                            ${project.types.map(type => `<span class="project-type">${type}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${project.company ? `
                        <div class="project-company">
                            <span class="company-name">${project.company.name}</span>
                            <span class="company-type">${project.company.type}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `
                    <span class="tech-tag">${tech}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render reach me section
function renderReachMeSection() {
    const reachMeContainer = document.getElementById('reach-me-links');
    if (!portfolioData || !portfolioData.reachMe) {
        reachMeContainer.innerHTML = '<p>No reach me links available.</p>';
        return;
    }

    reachMeContainer.innerHTML = portfolioData.reachMe.map((profile, index) => `
        <a href="${profile.url}" target="_blank" class="reach-me-link" title="${profile.name}" rel="noopener noreferrer">
            <img src="${profile.badge}" alt="${profile.name} badge" class="reach-me-badge" 
                 loading="lazy" onerror="this.style.opacity='0.5'" />
        </a>
    `).join('');
    
    // Add intersection observer for reach me animations
    const reachMeSection = document.querySelector('.reach-me');
    if (reachMeSection) {
        const reachMeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reach-me-section-visible');
                    reachMeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        reachMeObserver.observe(reachMeSection);
    }
}

function renderContactSection() {
    const { contact } = portfolioData;
    document.getElementById('contact-subtitle').textContent = contact.subtitle;
    document.getElementById('contact-description').textContent = contact.description;
    
    const contactMethods = document.getElementById('contact-methods');
    contactMethods.innerHTML = contact.methods.map(method => `
        <div class="contact-method">
            <i class="${method.icon}"></i>
            <div>
                <h4>${method.label}</h4>
                ${method.type === 'link' ? `
                    <a href="${method.link}" target="_blank">${method.value}</a>
                ` : `
                    <p>${method.value}</p>
                `}
            </div>
        </div>
    `).join('');
}

// Render footer
function renderFooter() {
    document.getElementById('footer-copyright').innerHTML = `&copy; ${portfolioData.settings.copyright}`;
}

// Back to Top Button functionality
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) {
        console.warn('Back to top button not found');
        return;
    }
    
    // Show or hide the back to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Theme Toggle
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);

// Update icon based on current theme
if (currentTheme === 'dark') {
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    if (newTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link (using event delegation)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth scrolling for navigation links (using event delegation)
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
            // Calculate offset to account for fixed navbar
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.offsetTop - navbarHeight - 20; // 20px extra padding
            
            // Smooth scroll to target with offset
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Remove focus from the clicked element to avoid sticky outline
            e.target.blur();
            
            // Update URL hash without jumping
            history.pushState(null, null, href);
        }
    }
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentTheme = body.getAttribute('data-theme');
    
    if (window.scrollY > 50) {
        navbar.style.background = currentTheme === 'dark' 
            ? 'rgba(22, 27, 34, 0.98)' 
            : 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = currentTheme === 'dark' 
            ? '0 2px 20px rgba(0, 0, 0, 0.3)' 
            : '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = currentTheme === 'dark' 
            ? 'rgba(22, 27, 34, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Animate skill bars on scroll
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach((bar, index) => {
                // Get the actual level from the parent skill-item
                const skillItem = bar.closest('.skill-item');
                const skillLevel = skillItem ? skillItem.dataset.level : '0';
                
                // Reset to 0
                bar.style.width = '0%';
                bar.style.transformOrigin = 'left';
                bar.style.transition = 'none';
                
                // Animate to the correct width with staggered delay
                setTimeout(() => {
                    bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    bar.style.width = skillLevel + '%';
                }, 200 + (index * 150));
            });
            
            // Only animate once
            skillObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// Animate elements on scroll
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    fadeObserver.observe(section);
});

// Observe project cards for staggered animation
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
    fadeObserver.observe(card);
});

// Form submission handler
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate form submission
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! I\'ll get back to you soon.');
            contactForm.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// Typing effect for hero section
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && portfolioData) {
        const text = portfolioData.personal.name;
        heroTitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect
        setTimeout(typeWriter, 1000);
    }
}

// Active navigation link highlighting
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Account for navbar height in scroll position calculation
        if (window.scrollY >= sectionTop - navbarHeight - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightActiveNavLink);
window.addEventListener('load', highlightActiveNavLink);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effect to project cards
const projectCardsAll = document.querySelectorAll('.project-card');
projectCardsAll.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 600ms linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-link.active {
        color: #667eea !important;
        font-weight: 600;
    }
    
    .experience-company-link,
    .education-institution-link {
        color: inherit;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.3s ease;
    }
    
    .experience-company-link:hover,
    .education-institution-link:hover {
        color: #667eea;
    }
    
    .experience-company-link i,
    .education-institution-link i {
        font-size: 0.8em;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .experience-company-link:hover i,
    .education-institution-link:hover i {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Apply ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Preload images
function preloadImages() {
    const images = [
        // Add any image URLs here if you have them
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();

// Initialize all animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Load portfolio data first
    loadPortfolioData();
    
    // Initialize back to top button
    initBackToTopButton();
    
    // Initialize animations after a short delay to ensure content is loaded
    setTimeout(() => {
        initializeAnimations();
    }, 100);
});

// Initialize animations function
function initializeAnimations() {
    // Add page loaded class for initial animations
    document.body.classList.add('page-loaded');
    
    // Define animation mappings
    const animationMappings = {
        '.stat-item': 'bounce-in',
        '.timeline-item': 'fade-in-left',
        '.education-timeline-item': 'fade-in-right',
        '.project-card': 'fade-in-scale',
        '.skill-category': 'fade-in-up',
        '.contact-method': 'fade-in-left',
        '.reach-me-badge': 'fade-in-up',
        '.section-title': 'slide-in-down'
    };
    
    // Enhanced intersection observer with staggered animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Apply appropriate animation class
                for (const [selector, animationClass] of Object.entries(animationMappings)) {
                    if (element.matches(selector)) {
                        element.classList.add(animationClass);
                        break;
                    }
                }
                
                // Add hover effects
                if (element.matches('.project-card, .education-timeline-content, .timeline-content')) {
                    element.classList.add('hover-lift');
                }
                
                if (element.matches('.stat-item, .reach-me-badge')) {
                    element.classList.add('hover-scale');
                }
                
                // Unobserve after animation
                animationObserver.unobserve(element);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Apply staggered delays to similar elements
    const staggeredElements = {
        '.stat-item': 0.1,
        '.project-card': 0.2,
        '.skill-category': 0.15,
        '.timeline-item': 0.2,
        '.education-timeline-item': 0.2,
        '.contact-method': 0.15,
        '.reach-me-badge': 0.1
    };
    
    Object.entries(staggeredElements).forEach(([selector, delay]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * delay}s`;
            animationObserver.observe(element);
        });
    });
    
    // Add floating animation to specific elements
    const floatingElements = document.querySelectorAll('.education-logo, .experience-logo');
    floatingElements.forEach(element => {
        element.classList.add('float');
    });
    
    // Add pulse animation to current job indicators
    const currentJobElements = document.querySelectorAll('.timeline-dot.current');
    currentJobElements.forEach(element => {
        element.classList.add('pulse');
    });
    
    // Add shimmer effect to loading states (removed from skill bars to avoid conflicts)
    // const loadingElements = document.querySelectorAll('.skill-progress');
    // loadingElements.forEach(element => {
    //     element.classList.add('shimmer');
    // });
    
    // Add scroll-triggered animations
    initScrollAnimations();
    
    // Add interactive hover effects
    initInteractiveAnimations();
}

// Scroll-triggered animations
function initScrollAnimations() {
    // Parallax effect for floating elements
    window.addEventListener('scroll', () => {
        const floatingElements = document.querySelectorAll('.float');
        floatingElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(window.scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Interactive animations
function initInteractiveAnimations() {
    // Add magnetic effect to buttons
    const magneticElements = document.querySelectorAll('.hero-btn-primary, .hero-btn-secondary, .hero-btn-outline');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    });
    
    // Add ripple effect to cards
    const cards = document.querySelectorAll('.project-card, .education-timeline-content, .timeline-content');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add tilt effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        });
    });
}

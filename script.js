/**
 * Portfolio Website Scripts
 * Handles theme switching, mobile navigation, and smooth scrolling
 */

'use strict';

// ============================================
// Theme Management
// ============================================

const ThemeManager = {
    /** @type {HTMLElement | null} */
    body: null,
    
    /** @type {HTMLElement | null} */
    toggleButtonMobile: null,
    
    /** @type {HTMLElement | null} */
    toggleButtonDesktop: null,
    
    /** @type {string} */
    STORAGE_KEY: 'theme',
    
    /**
     * Initialize theme manager
     */
    init() {
        this.body = document.body;
        this.toggleButtonMobile = document.getElementById('toggleButton');
        this.toggleButtonDesktop = document.getElementById('toggleButtonDesktop');
        
        if (!this.body) {
            console.warn('ThemeManager: Body element not found');
            return;
        }
        
        this.loadTheme();
        this.attachEventListeners();
        this.watchSystemTheme();
    },
    
    /**
     * Load saved theme or use system preference
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const systemTheme = this.getSystemThemePreference();
        const theme = savedTheme || systemTheme;
        
        if (theme === 'dark') {
            this.body.classList.add('dark-mode');
            // Also add to html element to match inline script behavior
            document.documentElement.classList.add('dark-mode');
        }
    },
    
    /**
     * Get system theme preference
     * @returns {string} 'dark' or 'light'
     */
    getSystemThemePreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },
    
    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        if (!this.body) return;
        
        const isDark = this.body.classList.toggle('dark-mode');
        // Also toggle on html element to match inline script behavior
        document.documentElement.classList.toggle('dark-mode', isDark);
        const theme = isDark ? 'dark' : 'light';
        
        localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    /**
     * Watch for system theme changes (only if no saved preference)
     */
    watchSystemTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        if (savedTheme) return; // Don't watch if user has a saved preference
        
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY) && this.body) {
                if (e.matches) {
                    this.body.classList.add('dark-mode');
                    document.documentElement.classList.add('dark-mode');
                } else {
                    this.body.classList.remove('dark-mode');
                    document.documentElement.classList.remove('dark-mode');
                }
            }
        };
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
        }
    },
    
    /**
     * Attach event listeners to theme toggle buttons
     */
    attachEventListeners() {
        if (this.toggleButtonMobile) {
            this.toggleButtonMobile.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.toggleButtonDesktop) {
            this.toggleButtonDesktop.addEventListener('click', () => this.toggleTheme());
        }
    }
};

// ============================================
// Mobile Navigation
// ============================================

const MobileNavigation = {
    /** @type {HTMLElement | null} */
    hamburgerMenu: null,
    
    /** @type {HTMLElement | null} */
    drawer: null,
    
    /** @type {HTMLElement | null} */
    overlay: null,
    
    /** @type {HTMLElement | null} */
    body: null,
    
    /** @type {NodeListOf<Element> | null} */
    navLinks: null,
    
    /**
     * Initialize mobile navigation
     */
    init() {
        this.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.drawer = document.getElementById('mobileDrawer');
        this.overlay = document.getElementById('drawerOverlay');
        this.body = document.body;
        this.navLinks = document.querySelectorAll('.mobile-navigation .nav-link');
        
        if (!this.hamburgerMenu || !this.drawer || !this.overlay) {
            console.warn('MobileNavigation: Required elements not found');
            return;
        }
        
        this.resetBodyStyles();
        this.initializeDrawerState();
        this.attachEventListeners();
    },
    
    /**
     * Reset body styles on page load
     */
    resetBodyStyles() {
        if (!this.body) return;
        
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.width = '';
        this.body.style.overflow = '';
        this.body.removeAttribute('data-scroll-y');
    },
    
    /**
     * Initialize drawer state (closed, not focusable)
     */
    initializeDrawerState() {
        if (!this.drawer) return;
        
        this.drawer.setAttribute('aria-hidden', 'true');
        const interactiveElements = this.drawer.querySelectorAll('a, button');
        
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '-1');
        });
    },
    
    /**
     * Toggle drawer open/closed state
     */
    toggleDrawer() {
        if (!this.drawer || !this.hamburgerMenu || !this.overlay || !this.body) return;
        
        const isOpening = !this.drawer.classList.contains('active');
        
        this.hamburgerMenu.classList.toggle('active');
        this.drawer.classList.toggle('active');
        this.overlay.classList.toggle('active');
        
        if (isOpening) {
            this.openDrawer();
        } else {
            this.closeDrawer();
        }
    },
    
    /**
     * Open drawer and prevent body scroll
     */
    openDrawer() {
        if (!this.drawer || !this.body) return;
        
        // Update accessibility
        this.drawer.setAttribute('aria-hidden', 'false');
        const interactiveElements = this.drawer.querySelectorAll('a, button');
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '0');
        });
        
        // Save scroll position and lock body
        const scrollY = window.scrollY || window.pageYOffset;
        this.body.setAttribute('data-scroll-y', scrollY.toString());
        this.body.style.position = 'fixed';
        this.body.style.top = `-${scrollY}px`;
        this.body.style.width = '100%';
        this.body.style.overflow = 'hidden';
    },
    
    /**
     * Close drawer and restore body scroll
     */
    closeDrawer() {
        if (!this.drawer || !this.body) return;
        
        // Update accessibility
        this.drawer.setAttribute('aria-hidden', 'true');
        const interactiveElements = this.drawer.querySelectorAll('a, button');
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '-1');
        });
        
        // Restore scroll position
        const scrollY = this.body.getAttribute('data-scroll-y') || '0';
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.width = '';
        this.body.style.overflow = '';
        this.body.removeAttribute('data-scroll-y');
        
        // Use requestAnimationFrame to ensure styles are reset before scrolling
        requestAnimationFrame(() => {
            window.scrollTo(0, parseInt(scrollY, 10));
        });
    },
    
    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        if (!this.hamburgerMenu || !this.drawer || !this.overlay) return;
        
        // Hamburger menu click
        this.hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDrawer();
        });
        
        // Overlay click to close
        this.overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDrawer();
        });
        
        // Navigation links click to close
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDrawer();
            });
        });
        
        // Prevent drawer clicks from closing
        this.drawer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
};

// ============================================
// Smooth Scrolling
// ============================================

const SmoothScroll = {
    /**
     * Initialize smooth scrolling for anchor links
     */
    init() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }
};

// ============================================
// Card Interactions
// ============================================

const CardInteractions = {
    /**
     * Initialize card click handlers
     * Note: Cards are wrapped in links, so this is for future extensibility
     */
    init() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.card-title');
                if (title) {
                    // Placeholder for future functionality (analytics, etc.)
                    console.log('Card clicked:', title.textContent);
                }
            });
        });
    }
};

// ============================================
// Initialization
// ============================================

/**
 * Initialize all functionality when DOM is ready
 */
function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    ThemeManager.init();
    MobileNavigation.init();
    SmoothScroll.init();
    CardInteractions.init();
}

// Start initialization
init();

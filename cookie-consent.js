// Cookie Consent Management System
(function() {
    'use strict';

    // Constants
    const CONSENT_KEY = 'bezott_cookie_consent';
    const ANALYTICS_KEY = 'bezott_analytics_consent';
    const CONSENT_TIMESTAMP = 'bezott_consent_timestamp';
    const CONSENT_EXPIRY_DAYS = 365; // Cookies consent expires after 1 year

    // Elements
    let cookieConsent;
    let cookieModal;
    let acceptAllBtn;
    let rejectAllBtn;
    let customizeBtn;
    let closeModalBtn;
    let savePreferencesBtn;
    let analyticsToggle;
    let cookieSettingsBtn;

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        checkConsent();
        attachEventListeners();
    });

    // Initialize all DOM elements
    function initializeElements() {
        cookieConsent = document.getElementById('cookieConsent');
        cookieModal = document.getElementById('cookieModal');
        acceptAllBtn = document.getElementById('acceptAll');
        rejectAllBtn = document.getElementById('rejectAll');
        customizeBtn = document.getElementById('customizeBtn');
        closeModalBtn = document.getElementById('closeModal');
        savePreferencesBtn = document.getElementById('savePreferences');
        analyticsToggle = document.getElementById('analyticsToggle');
        cookieSettingsBtn = document.getElementById('cookieSettingsBtn');
    }

    // Check if consent has been given
    function checkConsent() {
        const consent = localStorage.getItem(CONSENT_KEY);
        const timestamp = localStorage.getItem(CONSENT_TIMESTAMP);
        
        // Check if consent has expired (older than CONSENT_EXPIRY_DAYS)
        if (timestamp) {
            const consentDate = new Date(parseInt(timestamp));
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() - CONSENT_EXPIRY_DAYS);
            
            if (consentDate < expiryDate) {
                // Consent has expired, clear it and show banner again
                clearConsent();
                showBanner();
                return;
            }
        }
        
        if (!consent) {
            // No consent given yet, show banner
            showBanner();
        } else {
            // Consent already given, load preferences
            loadUserPreferences();
        }
    }

    // Show the cookie consent banner
    function showBanner() {
        setTimeout(function() {
            cookieConsent.classList.add('show');
        }, 500); // Slight delay for better UX
    }

    // Hide the cookie consent banner
    function hideBanner() {
        cookieConsent.classList.remove('show');
    }

    // Show the modal
    function showModal() {
        cookieModal.classList.add('show');
        // Load current preferences into modal
        const analyticsConsent = localStorage.getItem(ANALYTICS_KEY);
        if (analyticsToggle) {
            analyticsToggle.checked = analyticsConsent === 'true';
        }
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    // Hide the modal
    function hideModal() {
        cookieModal.classList.remove('show');
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Accept all cookies
    function acceptAll() {
        saveConsent('accepted', true);
        hideBanner();
        loadAnalytics();
        showConfirmationMessage('✓ Cookie preferences saved. Thank you!');
    }

    // Reject all non-essential cookies
    function rejectAll() {
        saveConsent('rejected', false);
        hideBanner();
        showConfirmationMessage('✓ Only essential cookies will be used.');
    }

    // Save consent preferences
    function saveConsent(consentType, analyticsEnabled) {
        localStorage.setItem(CONSENT_KEY, consentType);
        localStorage.setItem(ANALYTICS_KEY, analyticsEnabled.toString());
        localStorage.setItem(CONSENT_TIMESTAMP, Date.now().toString());
    }

    // Clear consent (for testing or expiry)
    function clearConsent() {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(ANALYTICS_KEY);
        localStorage.removeItem(CONSENT_TIMESTAMP);
    }

    // Save custom preferences from modal
    function saveCustomPreferences() {
        const analyticsEnabled = analyticsToggle ? analyticsToggle.checked : false;
        
        saveConsent('custom', analyticsEnabled);
        
        if (analyticsEnabled) {
            loadAnalytics();
        }
        
        hideModal();
        hideBanner();
        showConfirmationMessage('✓ Your cookie preferences have been saved.');
    }

    // Load user preferences and apply them
    function loadUserPreferences() {
        const analyticsConsent = localStorage.getItem(ANALYTICS_KEY);
        
        if (analyticsConsent === 'true') {
            loadAnalytics();
        }
    }

    // Load analytics scripts
    function loadAnalytics() {
        // Check if already loaded to prevent duplicate loading
        if (window.gaLoaded || window.cfAnalyticsLoaded) {
            return;
        }

        // Load Google Analytics
        if (typeof loadGoogleAnalytics === 'function') {
            loadGoogleAnalytics();
            window.gaLoaded = true;
            console.log('Google Analytics loaded');
        }

        // Load Cloudflare Analytics
        if (typeof loadCloudflareAnalytics === 'function') {
            loadCloudflareAnalytics();
            window.cfAnalyticsLoaded = true;
            console.log('Cloudflare Analytics loaded');
        }
    }

    // Show confirmation message
    function showConfirmationMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'cookie-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-weight: 600;
            animation: slideUpFade 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'slideDownFade 0.3s ease';
            setTimeout(function() {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Attach all event listeners
    function attachEventListeners() {
        // Accept all button
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', acceptAll);
        }

        // Reject all button
        if (rejectAllBtn) {
            rejectAllBtn.addEventListener('click', rejectAll);
        }

        // Customize button - open modal
        if (customizeBtn) {
            customizeBtn.addEventListener('click', function() {
                showModal();
            });
        }

        // Close modal button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }

        // Save preferences button
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', saveCustomPreferences);
        }

        // Cookie settings button (always visible)
        if (cookieSettingsBtn) {
            cookieSettingsBtn.addEventListener('click', function() {
                showModal();
            });
        }

        // Close modal when clicking outside
        if (cookieModal) {
            cookieModal.addEventListener('click', function(e) {
                if (e.target === cookieModal) {
                    hideModal();
                }
            });
        }

        // Keyboard accessibility - ESC to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && cookieModal && cookieModal.classList.contains('show')) {
                hideModal();
            }
        });
    }

    // Add animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUpFade {
            from {
                transform: translate(-50%, 20px);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
        @keyframes slideDownFade {
            from {
                transform: translate(-50%, 0);
                opacity: 1;
            }
            to {
                transform: translate(-50%, 20px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Expose functions for debugging (optional)
    window.bezottCookies = {
        clearConsent: clearConsent,
        checkConsent: checkConsent,
        showBanner: showBanner,
        getConsent: function() {
            return {
                consent: localStorage.getItem(CONSENT_KEY),
                analytics: localStorage.getItem(ANALYTICS_KEY),
                timestamp: localStorage.getItem(CONSENT_TIMESTAMP)
            };
        }
    };

})();

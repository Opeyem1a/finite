const OVERLAY_DIV_ID = `finite-scroll-overlay-div`;
const MESSAGE_DISPLAY_DIV_ID = `finite-scroll-message-display-div`;

const MESSAGES = [
    "Weren't you doing something?",
    "Why are you here?",
    "Get back to it.",
    "Make yourself proud.",
    "Focus.",
    "Lock in."
]

const PERMITTED_SCROLL_AMOUNT = window.innerHeight * 0.75;  // px
const MAX_INTENSITY = 1;
const MAX_BLUR = 100; // px
const MAX_DURATION = 1000 * 60 * 5; // ms

const DEFAULT_ALLOWED_URLS = [
    "*://*.instagram.com/direct/inbox/",
    "*://*.instagram.com/direct/*",
    "*://*.instagram.com/*/saved/*",
    "*://*.instagram.com/*/saved",
    "*://*.linkedin.com/jobs/*"
]
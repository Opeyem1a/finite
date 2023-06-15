const state = {
    isScrollActive: true,
    isTimeoutActive: true,

    isAllowedUrl: false,

    messageVisible: false,
    overlayVisible: false,

    timedOut: false,
    isTimerRunning: false,
    timerExtendedCount: 1,
    timedOutDuration: MAX_DURATION,

    scrolledOut: false,
    scrollExtendedCount: 1,
    scrollTriggerOffset: PERMITTED_SCROLL_AMOUNT,
}

const updateState = (newState = {}) => {
    for (const [key, value] of Object.entries(newState)) {
        state[key] = value;
    }
}

setInterval(() => {
    updateUserPreferenceState();
}, 500);

const updateUserPreferenceState = async () => {
    browser.storage.local.get(["finiteScrollActive", "finiteDurationActive"])
        .then((response) => {
            const prevState = {
                scrollActive: state.isScrollActive,
                timeoutActive: state.isTimeoutActive,
            }

            updateState({
                isScrollActive: response.finiteScrollActive ?? state.isScrollActive,
                isTimeoutActive: response.finiteDurationActive ?? state.isTimeoutActive,
            })

            if (!response.finiteScrollActive && state.scrolledOut) removeOverlay();
            if (!response.finiteDurationActive && state.timedOut) removeOverlay();

            if (!prevState.timeoutActive && state.isTimeoutActive) {
                startTimer();
            }
        })
        .catch((error) => {
            console.error(error);
        });
}
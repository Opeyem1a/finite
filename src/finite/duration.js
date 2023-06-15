const startTimer = () => {
    if (state.isTimerRunning || state.isAllowedUrl || !state.isTimeoutActive) return;

    updateState({isTimerRunning: true});
    setTimeout(() => {
        // do nothing if user is currently on an allowed url or timeout is currently inactive
        if (state.isAllowedUrl || !state.isTimeoutActive) {
            updateState({isTimerRunning: false, timedOut: false});
            return;
        }

        updateOverlayIntensity(MAX_INTENSITY);
        updateMessageVisibility(true);

        updateState({
            timedOut: true, isTimerRunning: false,
        });
        updateReason("You've been here a while, haven't you?");
        updateExtendButton(extendTimeout);
    }, state.timedOutDuration);
}

if (state.isTimeoutActive && !state.isAllowedUrl) {
    startTimer();
}

const extendTimeout = () => {
    updateState({
        timerExtendedCount: state.timerExtendedCount + 1,
        timedOut: false,
        timedOutDuration: state.timerExtendedCount * MAX_DURATION,  // in ms
    });
    removeOverlay();
    startTimer();
}
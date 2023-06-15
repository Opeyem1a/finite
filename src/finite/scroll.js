document.onscroll = (_) => {
    // if currently on an allowed url page, do nothing
    if (state.isAllowedUrl) return;
    // if finite scroll is toggled off, do nothing
    if (!state.isScrollActive) return;
    // do nothing if already displaying the overlay & message due to a timeout
    if (state.isTimeoutActive && state.timedOut) return;

    const amountScrolled = scrollProgress(state.scrollTriggerOffset);

    // update blur filter and darken colour of the covering div
    updateOverlayIntensity(amountScrolled);
    // check if user has scrolled into a block
    updateState({
        scrolledOut: !!amountScrolled,
    })

    // if the user is currently scrolled "deep" enough into the page, show the message div
    const shouldMessageRemainVisible = amountScrolled > 0.1;
    // if visibility did not change, do nothing
    if (state.messageVisible && shouldMessageRemainVisible) return;
    if (!state.messageVisible && !shouldMessageRemainVisible) return;

    updateMessageVisibility(shouldMessageRemainVisible);
    if (shouldMessageRemainVisible) {
        updateReason("Scrolling deep, are we?");
        updateExtendButton(extendScroll);
    }
};

/*
    Returns how deep the user is into their scroll as a decimal in the range [0, 1],
    Offset is how many pixels they can scroll before we start "counting" scroll progress
        (i.e. scroll progress is 0 until use scrolls 'offset' amount into the page)
 */
const scrollProgress = (offset = 0) => {
    const amountScrolled = Math.max(window.scrollY - offset, 0);
    return Math.min(Math.floor(amountScrolled / 25), 100) / 100;
}

const extendScroll = () => {
    state.scrollTriggerOffset = window.scrollY + (state.scrollExtendedCount * PERMITTED_SCROLL_AMOUNT);
    state.scrollExtendedCount += 1
    removeOverlay();
}

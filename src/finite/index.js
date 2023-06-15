// Check if the current url is allowed
setInterval(async () => {
    const isAllowedUrl = await isPathAllowed(location.href);
    updateState({ isAllowedUrl });
}, 800);

/*
Create the necessary DOM nodes for this extension to work.
This is an IIFE - see https://flaviocopes.com/javascript-iife/
 */
(function appendCreatedDivs() {
    const headElement = document.querySelector("head");
    const stylesheetLink = document.createElement("link");
    stylesheetLink.rel = "stylesheet";
    stylesheetLink.href = "src/styles/finite-styles.css";
    headElement.appendChild(stylesheetLink);

    const bodyElement = document.querySelector("body");

    const overlayDiv = createDiv(OVERLAY_DIV_ID, "full-screen-overlay soft-transition", {});
    bodyElement.appendChild(overlayDiv);

    const messageDisplayDiv = createDiv(MESSAGE_DISPLAY_DIV_ID, "full-screen-overlay soft-transition center-flex-col", {
        gap: "84px", opacity: 0,
    });

    messageDisplayDiv.innerHTML = `
            <div class="message-text-container center-flex-col" style="gap: 12px;">
                <div id="reason-text-div" class="center-text" style="opacity: 0.7; font-weight: 300; font-size: 12px;"></div>
                <div id="message-text-div" class="center-text" style="
                    font-size: 56px;
                ">
                    ${randomItemFrom(MESSAGES)}
                </div>
            </div>
            <div class="center-flex-row" style="gap: 16px">
                <button id="finite-extend-button" class="finite-button nude soft-transition" type="button">
                    It's important
                </button>
            </div>
        `
    bodyElement.appendChild(messageDisplayDiv);
})()


const updateReason = (reason) => {
    const reasonTextElement = document.getElementById("reason-text-div");
    reasonTextElement.innerText = reason;
}

const updateOverlayIntensity = (intensity = MAX_INTENSITY) => {
    const overlayDivElement = document.getElementById(OVERLAY_DIV_ID);

    const alreadyVisibleFromTimout = state.isTimeoutActive && state.timedOut;
    const _intensity = alreadyVisibleFromTimout ? 1 : intensity;

    const blurAmount = _intensity * MAX_BLUR;
    overlayDivElement.style["backdrop-filter"] = `blur(${blurAmount}px)`;
    overlayDivElement.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(_intensity, 0.75)})`

    overlayDivElement.style.pointerEvents = _intensity > 0.1 ? "auto" : "none";

    state.overlayVisible = _intensity > 0;
}

const updateMessageVisibility = (shouldBeVisible = true) => {
    const messageDivElement = document.getElementById(MESSAGE_DISPLAY_DIV_ID);

    if (!state.messageVisible) {
        // only get new message text if the message was previously not visible
        const messageTextElement = document.getElementById("message-text-div");
        messageTextElement.innerText = randomItemFrom(MESSAGES)
    }

    // make the message visible/not as needed
    messageDivElement.style.opacity = shouldBeVisible ? "1" : "0";
    state.messageVisible = shouldBeVisible;
}

const removeOverlay = () => {
    updateOverlayIntensity(0);
    updateMessageVisibility(false);
    updateState({
        timedOut: false,
        scrolledOut: false,
    })
}

const updateExtendButton = (func) => {
    const extendButtonElement = document.getElementById("finite-extend-button");
    extendButtonElement.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        func();
    }
}

$(document).ready(async () => {
    await renderAllowedUrls();

    $("#allowed-urls-add-form").on("submit", async function (e) {
        $(this).find('.alert').remove();
        const submittedUrlPattern = $("#urlInput").val();
        try {
            const urlPattern = await validateAllowedUrl(submittedUrlPattern);
            await addAllowedUrl(urlPattern);
            $(this).find("div").first().after(getAlert("success", `Successfully allowed access to ${urlPattern}`))
        } catch (error) {
            $(this).find("div").first().after(getAlert("warning", error.message))
        }
        await renderAllowedUrls();
        e.preventDefault();
    })

    $("#allowed-urls-batch-actions-form").on("submit", function (e) {
        const actionFunc = getActionFunc(e.originalEvent);
        const selectedUrlPatterns = $(`input[id^="allowed-url-item-"]`).toArray().filter(_ => !!_.checked).map(_ => _.dataset.urlPattern)
        actionFunc(selectedUrlPatterns);
        renderAllowedUrls();
        e.preventDefault();
    })
});

let testUrls = ["apple", "banana", "cheese"]

const renderAllowedUrls = async () => {
    try {
        const allowedWebsiteList = $("#allowed-websites-list");
        // const store = await browser.storage.sync.get(["allowedUrls"]);
        // let allowedUrls = store?.allowedUrls;
        // if (!allowedUrls) allowedUrls = loadDefaultAllowedUrls();
        const allowedUrls = await loadDefaultAllowedUrls();
        const listItems = allowedUrls.map((url, index) => listItem(url, `allowed-url-item-${index}`))
        allowedWebsiteList.empty();
        allowedWebsiteList.append(...listItems);
    } catch (error) {
        $("#allowed-websites-list").after(getAlert("danger", error));
    }

    const urlPatternCheckboxes = $(`input[id^="allowed-url-item-"]`);
    const deleteAllActionButton = $("#allowed-urls-delete-action");
    const batchActionsContainer = $("#batch-actions-container");
    toggleEnabledIf(batchActionsContainer, false);

    $("#allowed-urls-parent-checkbox").on("change", function () {
        urlPatternCheckboxes.prop('checked', this.checked);
        toggleEnabledIf(batchActionsContainer, this.checked);

        const numChecked = this.checked ? urlPatternCheckboxes.length : 0
        deleteAllActionButton.text(numChecked ? `Remove (${numChecked})` : "Remove");
        $(this).parent().find(`label[for="allowed-urls-parent-checkbox"]`).text(`${this.checked ? "Deselect" : "Select"} all`)
    });

    urlPatternCheckboxes.on("change", function () {
        const numChecked = urlPatternCheckboxes.toArray().filter(_ => !!_.checked).length;
        toggleEnabledIf(batchActionsContainer, !!numChecked);
        deleteAllActionButton.text(numChecked ? `Remove (${numChecked})` : "Remove");
    });
}

const validateAllowedUrl = async (urlPattern) => {
    // throws errors if invalid, returns cleaned urlPattern otherwise

    // clean: trim whitespace
    const cleanedUrlPattern = urlPattern.trim()
    // check if format valid
    // todo: check regex
    const regex = /^((.+)(\.))(.+)((\.)(.+))$/
    if (!regex.test(cleanedUrlPattern)) throw Error(`${cleanedUrlPattern} is not a valid url pattern.`);

    // check already exists
    try {
        if (testUrls.some(_ => _ === cleanedUrlPattern)) throw Error(`${cleanedUrlPattern} is already an allowed url pattern.`)
        // const prevAllowedUrls = await browser.storage.sync.get(["allowedUrls"]);
        // if (prevAllowedUrls.some(_ => _ === cleanedUrlPattern))
        //     throw Error(`${cleanedUrlPattern} is already an allowed url pattern.`)
    } catch (error) {
        throw error
    }

    return cleanedUrlPattern
}

const addAllowedUrl = async (url) => {
    // adds assuming it's all good, throws error if encountered
    testUrls = [url, ...testUrls]

    // try {
    //     const currentAllowedUrls = await browser.storage.sync.get(["allowedUrls"]);
    //     await browser.storage.sync.set({
    //         allowedUrls: [url, ...currentAllowedUrls]
    //     })
    // } catch(error) {
    //     throw error
    // }
}

const deleteSelected = async (selectedUrlPatterns) => {
    testUrls = testUrls.filter(url => !selectedUrlPatterns.find(_ => _ === url))

    try {
        const prevAllowedUrls = await browser.storage.sync.get(["allowedUrls"])
        await browser.storage.sync.set({
            allowedUrls: prevAllowedUrls.filter(url => !selectedUrlPatterns.find(_ => _ === url))
        })
    } catch (error) {
        console.error(error)
    }
}

const getActionFunc = (originalEvent) => {
    if (originalEvent.submitter?.dataset?.action === "delete-selected") {
        return deleteSelected
    }
}

const toggleEnabledIf = (container, enabled) => {
    // toggles contained buttons' disabled property
    container.children("button").each(function () {
        $(this).prop("disabled", !enabled)
    });
}

const listItem = (urlPattern, id) => {
    return `
    <li class="list-group-item">
      <input class="form-check-input" type="checkbox" value="" id="${id}" data-url-pattern="${urlPattern}">
      <label class="ms-1 form-check-label" for="${id}">
        ${urlPattern}
      </label>
    </li>
    `
}

const getAlert = (type, message) => {
    return `
    <div class="alert alert-${type} mb-0 mt-2 small py-2 px-3" role="alert">
      ${message}
    </div>
    `
}

const loadDefaultAllowedUrls = async () => {
    return testUrls
    // return browser.storage.sync.set({
    //     allowedUrls: DEFAULT_ALLOWED_URLS
    // }).then(() => {
    //     return DEFAULT_ALLOWED_URLS
    // }).catch(error => {
    //     console.error(error);  // todo: be smarter
    //     return []
    // })
}
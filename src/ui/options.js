$(document).ready(async () => {
    await renderAllowedUrls();

    $("#allowed-urls-add-form").on("submit", function (e) {
        $(this).find('.alert').remove();
        const submittedUrlPattern = $("#urlInput").val();

        validateAllowedUrl(submittedUrlPattern).then(urlPattern => {
            return addAllowedUrl(urlPattern)
        }).then((urlPattern) => {
            $(this).find("div").first().after(getAlert("success", `Successfully allowed access to ${urlPattern}`));
        }).then(() => {
            renderAllowedUrls();
        }).catch(error => {
            $(this).find("div").first().after(getAlert("warning", error.message))
        })

        e.preventDefault();
        return false
    })

    $("#allowed-urls-batch-actions-form").on("submit", function (e) {
        const actionFunc = getActionFunc(e.originalEvent);
        const selectedUrlPatterns = $(`input[id^="allowed-url-item-"]`).toArray().filter(_ => !!_.checked).map(_ => _.dataset.urlPattern)

        actionFunc(selectedUrlPatterns).then(() => {
            renderAllowedUrls();
        }).catch(error => {
            $(this).prepend(getAlert("danger", error.message));
        });

        e.preventDefault();
        return false
    })
});

const renderAllowedUrls = async () => {
    try {
        const allowedWebsiteList = $("#allowed-websites-list");
        const store = await browser.storage.sync.get(["allowedUrls"]);
        let allowedUrls = store?.allowedUrls;
        if (!allowedUrls) allowedUrls = await loadDefaultAllowedUrls();
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

const deleteSelected = async (selectedUrlPatterns) => {
    try {
        const store = await browser.storage.sync.get(["allowedUrls"]);
        const prevAllowedUrls = store.allowedUrls
        await browser.storage.sync.set({
            allowedUrls: prevAllowedUrls.filter(url => !selectedUrlPatterns.find(_ => _ === url))
        })
    } catch (error) {
        $("form").first().after(getAlert("danger", error))
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

const loadDefaultAllowedUrls = async () => {
    return browser.storage.sync.set({
        allowedUrls: DEFAULT_ALLOWED_URLS
    }).then(() => {
        return DEFAULT_ALLOWED_URLS
    }).catch(error => {
        throw error
    })
}
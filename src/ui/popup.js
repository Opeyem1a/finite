$(document).ready(() => {
    browser.storage.local.get(["finiteScrollActive", "finiteDurationActive"])
        .then((response) => {
            $("#finiteScrollCheckbox").prop('checked', response.finiteScrollActive ?? true);
            $("#finiteDurationCheckbox").prop('checked', response.finiteDurationActive ?? true);
        })
        .catch((error) => {
            $("#output").text(`e ${error}`)
        });

    browser.tabs.query({currentWindow: true, active: true})
        .then((tabs) => {
            const tab = tabs[0]; // Safe to assume there will only be one result
            $("#urlInput").val(tab.url);  // todo: be smarter about this
            return isPathAllowed(tab.url);
        })
        .then((isUrlAllowed) => {
            // disable checkboxes if the page is an allowed url
            $(".form-check-input").prop("disabled", isUrlAllowed);
            if (isUrlAllowed) {
                $("#checkboxContainer").append(getAlert("info", "This URL is allowed. Finite is disabled.")); // :)
                $(".allow-access-section").hide();
            }
        })
        .catch((error) => {
            $("#checkboxContainer").append(getAlert("danger", error)); // :)
        })

    $('#edit-allowed-link').on('click', () => {
        browser.runtime.openOptionsPage();
    });

    $("#allowed-urls-add-form").on("submit", function (e) {
        $(this).find('.alert').remove();
        const submittedUrlPattern = $("#urlInput").val();

        validateAllowedUrl(submittedUrlPattern).then(urlPattern => {
            return addAllowedUrl(urlPattern)
        }).then((urlPattern) => {
            $(this).find("div").first().after(getAlert("success", `Successfully allowed access to ${urlPattern}`));
        }).catch(error => {
            $(this).find("div").first().after(getAlert("warning", error.message))
        })

        e.preventDefault();
        return false
    })

    addToggleEventListener("#finiteScrollCheckbox", "#finiteScrollSpinner", setFiniteScrollActive);
    addToggleEventListener("#finiteDurationCheckbox", "#finiteDurationSpinner", setFiniteDurationActive);
});


const addToggleEventListener = (inputId, spinnerId, toggleFunction) => {
    $(inputId).on("change", function () {
        $(spinnerId).removeClass("d-none").addClass("d-inline-block");
        toggleFunction(this.checked)
            .then(() => {
                $(spinnerId).removeClass("d-inline-block").addClass("d-none");
            })
            .catch((error) => {
                $("#checkboxContainer").append(getAlert("danger", error)); // :)
            })
    });
}


const setFiniteScrollActive = async (value) => {
    return browser.storage.local.set({
        finiteScrollActive: value,
    }).then(() => {
        return value;
    }).catch((error) => {
        throw error;
    })
}

const setFiniteDurationActive = async (value) => {
    return browser.storage.local.set({
        finiteDurationActive: value,
    }).then(() => {
        return value;
    }).catch((error) => {
        throw error;
    })
}
const getAlert = (type, message) => {
    return `
    <div class="alert alert-${type} mb-0 mt-2 small py-2 px-3" role="alert">
      ${message}
    </div>
    `
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
        const store = await browser.storage.sync.get(["allowedUrls"]);
        const prevAllowedUrls = store.allowedUrls;
        if (prevAllowedUrls.some(_ => _ === cleanedUrlPattern)) throw Error(`${cleanedUrlPattern} is already an allowed url pattern.`)
    } catch (error) {
        throw error
    }

    return cleanedUrlPattern
}

const addAllowedUrl = async (url) => {
    // adds assuming it's all good, throws error if encountered
    try {
        const store = await browser.storage.sync.get(["allowedUrls"]);
        const currentAllowedUrls = store.allowedUrls;
        await browser.storage.sync.set({
            allowedUrls: [url, ...currentAllowedUrls]
        })
        return url
    } catch (error) {
        throw error
    }
}
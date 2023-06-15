const css = (element, styles) => {
    for (const property in styles) element.style[property] = styles[property];
}

const createDiv = (id, classes, styles) => {
    const createdDiv = document.createElement("div");
    createdDiv.className = classes;
    createdDiv.id = id;
    css(createdDiv, styles);
    return createdDiv;
}

const randomItemFrom = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const isPathAllowed = async (currentUrl) => {
    const response = await browser.storage.sync.get(["allowedUrls"]);
    const allowedUrls = response.allowedUrls ?? [];

    const convertToRegex = (urlString) => {
        const escaped = urlString.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string, this auto-escapes regex characters
        return RegExp(escaped.replaceAll(/\*/g, ".*"));  // replace * (literally) with .+, which is regex for "anything"
    }

    return allowedUrls.some(url => convertToRegex(url).test(currentUrl))
}

const inspect = async (currentUrl) => {
    const response = await browser.storage.sync.get(["allowedUrls"]);
    const allowedUrls = response.allowedUrls ?? [];

    const convertToRegex = (urlString) => {
        const escaped = urlString.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        return RegExp(escaped.replaceAll(/\*/g, ".+"));  // replace * (literally) with .+, which is regex for "anything"
    }

    return [currentUrl, ...allowedUrls.map(url => convertToRegex(url))]
}
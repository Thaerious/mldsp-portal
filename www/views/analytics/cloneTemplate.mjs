function cloneTemplate(templateSelector, containerSelector) {
    const container = document.querySelector(containerSelector);
    const template = document.querySelector(templateSelector);
    const clone = template.content.firstElementChild.cloneNode(true);
    container.appendChild(clone);
    return clone;
}

export default cloneTemplate;
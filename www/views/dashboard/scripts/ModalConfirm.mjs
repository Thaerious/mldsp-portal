
class ModalConfirm{

    static show(text) {
        const ele = document.querySelector("#modal-confirm");
        const modal = new bootstrap.Modal(ele, {});
        const body = document.querySelector("#modal-confirm .modal-body");
        body.innerText = text;
        modal.show();
    }
}

export default ModalConfirm;
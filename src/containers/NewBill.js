import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
    constructor({ document, onNavigate, firestore, localStorage }) {
        this.document = document;
        this.onNavigate = onNavigate;
        this.firestore = firestore;
        const formNewBill = this.document.querySelector(
            `form[data-testid="form-new-bill"]`
        );
        formNewBill.addEventListener("submit", this.handleSubmit);
        this.fileInput = this.document.querySelector(
            `input[data-testid="file"]`
        );
        this.fileInput.addEventListener("change", this.handleChangeFile);
        this.fileUrl = null;
        this.fileName = null;
        this.authorizedExtensions = ["png", "jpg", "jpeg"];
        this.buttonSendBill = document.getElementById("btn-send-bill");
        new Logout({ document, localStorage, onNavigate });
    }

    handleChangeFile = (e) => {
        const file = this.document.querySelector(`input[data-testid="file"]`)
            .files[0];

        // Handle File Extension
        if (!this.checkFileExtension(file.name)) return;

        const filePath = e.target.value.split(/\\/g);
        console.log(filePath)
        const fileName = filePath[filePath.length - 1];
        this.firestore.storage
            .ref(`justificatifs/${fileName}`)
            .put(file)
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => {
                this.fileUrl = url;
                this.fileName = fileName;
            });
    };

    checkFileExtension(fileName) {
        let fileStringArray = fileName.split(".");
        if (
            this.authorizedExtensions.filter(
                (a) =>
                    a ===
                    fileStringArray[fileStringArray.length - 1].toLowerCase()
            ).length < 1
        ) {
            this.buttonSendBill.setAttribute("disabled", "true");
            let errorMessage = this.document.createElement("div");
            errorMessage.textContent =
                "Seuls les fichiers jpg, jpeg et png sont autorisés";
            errorMessage.style.color = "red";
            errorMessage.id = "fileInputError";
            this.fileInput.parentNode.appendChild(errorMessage);
            return false;
        } else {
            this.buttonSendBill.removeAttribute("disabled");
            if (document.getElementById("fileInputError"))
                document.getElementById("fileInputError").remove();
            return true;
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(
            'e.target.querySelector(`input[data-testid="datepicker"]`).value',
            e.target.querySelector(`input[data-testid="datepicker"]`).value
        );
        const email = JSON.parse(localStorage.getItem("user")).email;
        const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`)
                .value,
            name: e.target.querySelector(`input[data-testid="expense-name"]`)
                .value,
            amount: parseInt(
                e.target.querySelector(`input[data-testid="amount"]`).value
            ),
            date: e.target.querySelector(`input[data-testid="datepicker"]`)
                .value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct:
                parseInt(
                    e.target.querySelector(`input[data-testid="pct"]`).value
                ) || 20,
            commentary: e.target.querySelector(
                `textarea[data-testid="commentary"]`
            ).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: "pending",
        };
        this.createBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
    };

    // not need to cover this function by tests
    createBill = (bill) => {
        if (this.firestore) {
            this.firestore
                .bills()
                .add(bill)
                .then(() => {
                    this.onNavigate(ROUTES_PATH["Bills"]);
                })
                .catch((error) => error);
        }
    };
}

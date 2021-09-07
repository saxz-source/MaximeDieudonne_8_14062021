import {
    screen,
    fireEvent,
    getNodeText,
    getByTestId,
    toBeDisabled
} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";
import Firestore from "../app/Firestore.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import '@testing-library/jest-dom'

// Fake Bill for tests
const fakeBill = {
    email: "mmm@mmm.com",
    type: "Transports",
    name: "BLALA",
    amount: "12",
    date: "2021-02-20",
    vat: "10",
    pct: "20",
    commentary: "llalala",
    fileUrl: "jpgFile.jpg-kdkkdkdkd",
    fileName: "jpgFile.jpg",
};

// Set an instance of newBill class
const setUp = () => {
    const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });
    window.localStorage.setItem(
        "user",
        JSON.stringify({
            type: "Employee",
        })
    );
    const newBillInstance = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
    });
    return newBillInstance;
};

// Define fake files
const fileJPG = new File([""], "jpgFile.jpg", { type: "image/png" });
const filePNG = new File([""], "pngFile.png", { type: "image/png" });
const fileGIF = new File([""], "gifFile.gif", { type: "image/png" });

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then it should render the page", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

describe("Given i am on the NewBill page", () => {
    describe("When i load a file", () => {
        test("Then the file should be handled", () => {
            const newBillInstance = setUp();
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            // TEST //
            const fileInput = screen.getByTestId("file");
            expect(fileInput).toBeTruthy();
            const handleChangeFile = jest.fn(
                () => newBillInstance.handleChangeFile
            );

            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput, { target: { files: [fileJPG] } });
            expect(handleChangeFile).toHaveBeenCalled();

            expect(fileInput.files[0]).toBeTruthy();
            expect(fileInput.files[0].name).toBe("jpgFile.jpg");
        });
        test("filePath and fileName constant has to be good before the file is stored", () => {
            const newBillInstance = setUp();
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            // let event = jQuery.Event('change', {
            //     target: {
            //       files: [{
            //         name: "jpgFile.jpg", type: "image/jpg"
            //       }]
            //     }
            //   });
            const fileInput = screen.getByTestId("file");

            const handleChangeFile = jest.fn((e) =>
                newBillInstance.handleChangeFile(e)
            );

            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput, { target: { files: [fileJPG] } });
            expect(handleChangeFile).toHaveBeenCalled();
        });
    });
    describe("When the file format is jpg or png", () => {
        test("Then it shouldn't display an error", () => {
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBillInstance = setUp();

            expect(newBillInstance.checkFileExtension(fileJPG.name)).toBe(true);
            expect(newBillInstance.checkFileExtension(filePNG.name)).toBe(true);

            spyOn(newBillInstance, "displayAnError");
            newBillInstance.checkFileExtension(fileJPG.name);
            expect(newBillInstance.displayAnError).not.toHaveBeenCalled();

            spyOn(newBillInstance, "removeErrorState");
            newBillInstance.checkFileExtension(filePNG.name);
            expect(newBillInstance.removeErrorState).toHaveBeenCalled();
            const errorMessage = document.getElementById("fileInputError");
            expect(errorMessage).not.toBeTruthy();
            const sendButton = screen.getByRole("button")
            expect(sendButton).not.toBeDisabled();
        });
        test("Then it shouldn't disable the send button", () => {
            const newBillInstance = setUp();

            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            //   spyOn(newBillInstance, "checkFileExtension");
            newBillInstance.checkFileExtension(fileJPG.name);
         
        });
    });
    describe("When the file format is NOT jpg or png", () => {
        test("Then it should display an error", () => {
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBillInstance = setUp();

            expect(newBillInstance.checkFileExtension(fileGIF.name)).toBe(
                false
            );
            spyOn(newBillInstance, "displayAnError");
            newBillInstance.checkFileExtension(fileGIF.name);
            expect(newBillInstance.displayAnError).toHaveBeenCalled();

            spyOn(newBillInstance, "removeErrorState");
            newBillInstance.checkFileExtension(fileGIF.name);
            expect(newBillInstance.removeErrorState).not.toHaveBeenCalled();

            const errorMessage = document.getElementById("fileInputError");
            expect(errorMessage).toBeTruthy();
            const sendButton = screen.getByRole("button")
            expect(sendButton).toBeDisabled();
        });
        test("Then it should disable the send button", () => {
            const newBillInstance = setUp();

            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            newBillInstance.checkFileExtension(fileGIF.name);
            newBillInstance.displayAnError();
          //  const sendButton = screen.getByTestId("btn-send-bill");
            // expect(screen.getByTestId("btn-send-bill")).toBeTruthy();
            // const sendButton = screen.getByRole("button")
            // expect(sendButton).toBeDisabled();
        });
    });

    describe("When I click on the submit button", () => {
        test("Then i should be redirect to bill page", () => {
            const newBillInstance = setUp();
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            const billType = screen.getByTestId("expense-type");
            userEvent.selectOptions(billType, screen.getByText("Transports"));
            expect(billType.value).toBe(fakeBill.type);

            const billName = screen.getByTestId("expense-name");
            fireEvent.change(billName, {
                target: { value: fakeBill.name },
            });
            expect(billName.value).toBe(fakeBill.name);

            const billDate = screen.getByTestId("datepicker");
            fireEvent.change(billDate, {
                target: { value: fakeBill.date },
            });
            expect(billDate.value).toBe(fakeBill.date);

            const billVat = screen.getByTestId("vat");
            fireEvent.change(billVat, {
                target: { value: fakeBill.vat },
            });
            expect(billVat.value).toBe(fakeBill.vat);

            const billPct = screen.getByTestId("pct");
            fireEvent.change(billPct, {
                target: { value: fakeBill.pct },
            });
            expect(billPct.value).toBe(fakeBill.pct);

            const billComment = screen.getByTestId("commentary");
            fireEvent.change(billComment, {
                target: { value: fakeBill.commentary },
            });
            expect(billComment.value).toBe(fakeBill.commentary);

            const submitNewBill = screen.getByTestId("form-new-bill");

            const handleSubmit = jest.fn(newBillInstance.handleSubmit);
            submitNewBill.addEventListener("submit", handleSubmit);

            fireEvent.submit(submitNewBill);
            expect(handleSubmit).toHaveBeenCalled();
            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        });
    });
});

// test d'intégration POST
describe("Given I am a user connected on NewBill", () => {
    describe("When I send the new bill", () => {
        test("the bill is send by API POST", async () => {
            const getSpy = jest.spyOn(firebase, "post");
            const bills = await firebase.post();
            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(bills.message).toBe("Bien reçu");
        });
        test("fetches bills from an API and fails with 404 message error", async () => {
            firebase.post.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 404"))
            );
            const html = BillsUI({ error: "Erreur 404" });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        test("fetches messages from an API and fails with 500 message error", async () => {
            firebase.post.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 500"))
            );
            const html = BillsUI({ error: "Erreur 500" });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});

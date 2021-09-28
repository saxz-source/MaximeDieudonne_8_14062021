import {
    screen,
    fireEvent,
} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";
import Firestore from "../app/Firestore.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import "@testing-library/jest-dom";
import { fakeBill } from "../fixtures/fakeBill.js";
import { fileGIF, fileJPG, filePNG } from "../fixtures/fakeFiles.js";



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



describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then it should render the page", () => {
            // define html context
            const html = NewBillUI();
            document.body.innerHTML = html;
            // check if the ui is rendered
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

describe("Given i am on the NewBill page", () => {
    describe("When i load a file", () => {
        test("Then the file should be handled", () => {
            // Create a newBill instance
            const newBillInstance = setUp();
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            // Get the input tag
            const fileInput = screen.getByTestId("file");
            // Be sure it exists
            expect(fileInput).toBeTruthy();
            // Mock the handling function we test
            const handleChangeFile = jest.fn((e) =>
                newBillInstance.handleChangeFile(e)
            );
            // Set a listenener on the input tag
            fileInput.addEventListener("change", handleChangeFile);
            // Trigger the input
            fireEvent.change(fileInput, { target: { files: [fileJPG] } });
            // Check the handling function is triggered
            expect(handleChangeFile).toHaveBeenCalled();
            // Check if we have a file and which one
            expect(fileInput.files[0]).toBeTruthy();
            expect(fileInput.files[0].name).toBe("jpgFile.jpg");
        });
    });
    describe("When the file format is jpg or png", () => {
        test("Then it shouldn't display an error", () => {
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;
            // Create an instance of NewBill
            const newBillInstance = setUp();
            // Check the value return by the function which check the authorized formats
            expect(newBillInstance.checkFileExtension(fileJPG.name)).toBe(true);
            expect(newBillInstance.checkFileExtension(filePNG.name)).toBe(true);
            // Spy the behavior of the error displayer we don't want to be called
            spyOn(newBillInstance, "displayAnError");
            newBillInstance.checkFileExtension(fileJPG.name);
            expect(newBillInstance.displayAnError).not.toHaveBeenCalled();
            // Spy the behavior of the error remover we want to be called
            spyOn(newBillInstance, "removeErrorState");
            newBillInstance.checkFileExtension(filePNG.name);
            expect(newBillInstance.removeErrorState).toHaveBeenCalled();

            spyOn(newBillInstance, "removeErrorElement");
            newBillInstance.checkFileExtension(fileJPG.name);
            expect(newBillInstance.removeErrorElement).not.toHaveBeenCalled();
            // Check if the error has been created
            const errorMessage = document.getElementById("fileInputError");
            expect(errorMessage).not.toBeTruthy();
            // Check the disable state of the button
            const sendButton = screen.getByRole("button");
            expect(sendButton).not.toBeDisabled();
        });
    });
    describe("When the file format is NOT jpg or png", () => {
        test("Then it should display an error", () => {
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;
            // Create a newBill instance
            const newBillInstance = setUp();
            // Check the value return by the function which check the authorized formats
            expect(newBillInstance.checkFileExtension(fileGIF.name)).toBe(
                false
            );
            // Spy the behavior of the error displayer we want to be called
            spyOn(newBillInstance, "displayAnError");
            newBillInstance.checkFileExtension(fileGIF.name);
            expect(newBillInstance.displayAnError).toHaveBeenCalled();
            // Spy the behavior of the error remover we don't want to be called
            spyOn(newBillInstance, "removeErrorState");
            newBillInstance.checkFileExtension(fileGIF.name);
            expect(newBillInstance.removeErrorState).not.toHaveBeenCalled();
            // Check if the error element has been created
            const errorMessage = document.getElementById("fileInputError");
            expect(errorMessage).toBeTruthy();
            // Check if the button has been disabled
            const sendButton = screen.getByRole("button");
            expect(sendButton).toBeDisabled();
        });
    });

    describe("When I click on the submit button", () => {
        test("Then i should be redirect to bill page", () => {
            //Create a newBill instance
            const newBillInstance = setUp();
            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;

            // For all the inputs, get them and trigger them
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

            // Get the sumbit button
            const submitNewBill = screen.getByTestId("form-new-bill");
            // Mock the submit function
            const handleSubmit = jest.fn(newBillInstance.handleSubmit);
            submitNewBill.addEventListener("submit", handleSubmit);
            // Trigger the submit
            fireEvent.submit(submitNewBill);
            // Check the handling function has been called
            expect(handleSubmit).toHaveBeenCalled();
            // Checked we navigate to the bills UI
            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        });
    });
});

// Integration test POST request
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

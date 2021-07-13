import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

const file1 = new File([""], "filename", { type: "text/html" });

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then it should render the page", () => {
            const html = NewBillUI({ data: [] });
            document.body.innerHTML = html;
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

describe("Given i am on the NewBill page", () => {
    describe("When i load a file", () => {
        test("Then the file should be handled", () => {
            // Define global datas we need
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

            // Set a new fake Bill
            const newBillInstance = new NewBill({
                document,
                onNavigate,
                firestore: null,
                localStorage: window.localStorage,
            });

            // Define DOM context
            const html = NewBillUI();
            document.body.innerHTML = html;
            const fileInput = screen.getByTestId("file");
            const handleChangeFile = jest.fn(
                () => newBillInstance.handleChangeFile
            );

            //     const checkFileExtension  = jest.fn(
            //       () => newBillInstance.checkFileExtension
            //   );

            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput);
            expect(handleChangeFile).toHaveBeenCalled();

            expect(fileInput.files[0]).toBeTruthy()
            
            fileInput.find('input').simulate('change', {target: {files: [file1]}});
            expect(fileInput.files[0]).toBeTruthy()

            // expect(checkFileExtension).toHaveBeenCalled()
        });
    });
});

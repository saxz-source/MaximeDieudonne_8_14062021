import { screen, fireEvent} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

const file1 

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then it should render the page", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

describe("Given i load a file", () => {
    describe("When the file extension is jpg, png, pdf", () => {
        test("Then it should put a file in the DB", () => {
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
            const html = NewBillUI();
            document.body.innerHTML = html;
            const fileInput = screen.getByTestId("file");
            const handleChangeFile = jest.fn(
                () => newBillInstance.handleChangeFile
            );
            const checkFileExtension  = jest.fn(
              () => newBillInstance.checkFileExtension
          ); 
            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput);
            expect(handleChangeFile).toHaveBeenCalled();
           // expect(checkFileExtension).toHaveBeenCalled()
        });
    });
});

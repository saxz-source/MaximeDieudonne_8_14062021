import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import NewBillUI from "../views/NewBillUI.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import firebase from "../__mocks__/firebase.js";
const $ = require("jquery");

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;
            //to-do write expect expression
        });
        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            //  console.log(dates);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    describe("When i click on the eye-icon", () => {
        test("Then it shoud open the modal", () => {
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

            const billsInstance = new Bills({
                document,
                onNavigate,
                firestore: null,
                localStorage: window.localStorage,
            });

            // Define the DOM
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;

            // // Define the eye icon
            //         const iconEye = screen.getAllByTestId("icon-eye");

            //         // Mock the modal
            //         $.fn.modal = jest.fn();

            //         if (iconEye) {
            //             iconEye.forEach((icon) => {
            //                 const handleClickIconEye = jest.fn(() =>
            //                     billsInstance.handleClickIconEye(icon)
            //                 );
            //                 icon.addEventListener("click", handleClickIconEye);
            //                 userEvent.click(icon);
            //                 expect(handleClickIconEye).toHaveBeenCalled();
            //             });
            //         }

            // Define the eye icon
            const iconEye = screen.getAllByTestId("icon-eye")[0];

            // Mock the modal
            $.fn.modal = jest.fn();

            const handleClickIconEye = jest.fn(() =>
                billsInstance.handleClickIconEye(iconEye)
            );
            iconEye.addEventListener("click", handleClickIconEye);
            fireEvent.click(iconEye);
            expect(handleClickIconEye).toHaveBeenCalled();

            let newHTML = document.getElementsByTagName("body")[0];
            document.body.innerHTML = newHTML;

            expect(newHTML.classList.contains("modal-open")).toBeTruthy;
        });
    });
    describe("When i click on the NewBill button", () => {
        test("Then it shoud navigate to NewBill UI", () => {
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

            const billsInstance = new Bills({
                document,
                onNavigate,
                firestore: null,
                localStorage: window.localStorage,
            });
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;

            const newBillButton = screen.getByTestId("btn-new-bill");

            $.fn.modal = jest.fn();

            const handleClickNewBill = jest.fn(() =>
                billsInstance.handleClickNewBill()
            );
            newBillButton.addEventListener("click", handleClickNewBill);
            userEvent.click(newBillButton);
            expect(handleClickNewBill).toHaveBeenCalled();

            //  expect(modalFile).toBeTruthy()

            //const way = billsInstance.onNavigate
            // const follow = jest.fn(() =>  billsInstance.onNavigate(ROUTES_PATH["NewBill"]))

            //        expect(follow).toHaveReturnedWith("NewBill")
            //    const rootDiv = document.getElementById("root");
            //    expect(rootDiv).getAllByText("ew")
        });
    });
});

describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            const getSpy = jest.spyOn(firebase, "get");
            const bills = await firebase.get();
            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(bills.data.length).toBe(4);
        });
        test("fetches bills from an API and fails with 404 message error", async () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 404"))
            );
            const html = BillsUI({ error: "Erreur 404" });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        test("fetches messages from an API and fails with 500 message error", async () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error("Erreur 500"))
            );
            const html = BillsUI({ error: "Erreur 500" });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});

describe("Given I am connected to the Bill page", () => {
    describe("I click on the 'newBill Button'", () => {
        test("It should render newBills Form", () => {
            document.body.innerHTML = NewBillUI();
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });
});

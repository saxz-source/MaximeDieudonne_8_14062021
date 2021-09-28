import { screen, fireEvent, queryByTestId } from "@testing-library/dom";
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
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    describe("If there is no Icon-eye", () => {
        test("no event listener should be put on it", () => {
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;
            //to-do write expect expression
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
            const firestore = null;
            // Create a bills instance
            const billsInstance = new Bills({
                document,
                onNavigate,
                firestore,
                localStorage: window.localStorage,
            });

            let icon = screen.queryByTestId("iconEye")
            expect(icon).not.toBeTruthy()
         
        });
    });
    describe("When i click on a eye-icon", () => {
        test("Then it should open the modal", () => {
            // Define the DOM
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            // Set up the instance of Bills class
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
            const firestore = null;
            // Create a bills instance
            const billsInstance = new Bills({
                document,
                onNavigate,
                firestore,
                localStorage: window.localStorage,
            });

            // Mock the modal
            $.fn.modal = jest.fn();
            // Define the eye icon
            let iconEye = screen.getAllByTestId("icon-eye")[0];
            // Mock the click handler
            const handleClickIconEye = jest.fn(() =>
                billsInstance.handleClickIconEye(iconEye)
            );
            // Set a click listener on the icon
            iconEye.addEventListener("click", handleClickIconEye);
            //Trigger the function
            fireEvent.click(iconEye);
            // Check if the function has been called
            expect(handleClickIconEye).toHaveBeenCalled();
            // Check if the modal is in the DOM
            const modal = document.getElementById("modaleFile");
            expect(modal).toBeTruthy();
            iconEye = false
            expect(iconEye).toBe(false)
        });
    });
    describe("When i click on the NewBill button", () => {
        test("Then it should navigate to NewBill UI", () => {
            //Define the html context
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            // Set up the instance of NewBill class
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
            //Create an instance of NewBill class
            const billsInstance = new Bills({
                document,
                onNavigate,
                firestore: null,
                localStorage: window.localStorage,
            });

            //Mock the modal
            $.fn.modal = jest.fn();
            //Get the click button
            const newBillButton = screen.getByTestId("btn-new-bill");

            //Mock the click handler
            const handleClickNewBill = jest.fn(() =>
                billsInstance.handleClickNewBill()
            );
            //Set the event listener
            newBillButton.addEventListener("click", handleClickNewBill);
            //Trigger the click
            userEvent.click(newBillButton);
            // The click is handled
            expect(handleClickNewBill).toHaveBeenCalled();
            // We navigate to newBill's UI
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });
});

// Integration Test for GET request
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

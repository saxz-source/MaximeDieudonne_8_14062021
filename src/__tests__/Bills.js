import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import NewBillUI from "../views/NewBillUI.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
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
                // .getAllByText(
                //     /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                // )
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            console.log(dates);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    // describe("When i click on the eye-icon", ()=>{
    //     test("Then it shoud open the modal and display the image", ()=>{
    //         const html = BillsUI({ data: bills });
    //         document.body.innerHTML = html;

    //         const eyeIconButton = screen.getAllByTestId("icon-eye")
    //         const handleClickIconEye = jest.fn((e) => eyeIconButton.handleClickIconEye(icon))
    //         eyeIconButton.addEventListener("click", handleClickIconEye)

    //         fireEvent.click(eyeIconButton)
    //         expect(handleClickIconEye).toHaveBeenCalled()
    //     })

    // })

    describe("When i click on the eye-icon", () => {
        test("Then it shoud open the modal and display the image", () => {
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

            const iconEye = screen.getAllByTestId(
                "icon-eye"
            );

            $.fn.modal = jest.fn();

            if (iconEye) {
                iconEye.forEach((icon) => {
                    const handleClickIconEye = jest.fn(() =>
                        billsInstance.handleClickIconEye(icon)
                    );
                    icon.addEventListener("click", handleClickIconEye);
                    userEvent.click(icon);
                    expect(handleClickIconEye).toHaveBeenCalled();
                });
            
            }
             
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

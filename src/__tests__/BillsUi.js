import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Actions from "../views/Actions.js";
import { bills } from "../fixtures/bills";
import { row } from "../views/BillsUI.js";

const bill = {
    id: "47qAXb6fIm2zOKkLzMro",
    vat: "80",
    fileUrl:
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "Accepté",
    type: "Hôtel et logement",
    commentAdmin: "ok",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    email: "a@a",
    pct: 20,
};

describe("Given I am connected as a user and I am on Bills Page", () => {
    describe("When bill data is passed to BillsUI", () => {
        test("Then, it should render the UI", () => {
            // Define html context with "bills" data
            const html = BillsUI(bills);
            document.body.innerHTML = html;
            //Check if the UI is displayed
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        });
    });

    describe("When bills data is passed to BillsUI ", () => {
        test("Then, we should see the data", () => {
            // Define the html context
            const mappedBills = row(bill);
            document.body.innerHTML = mappedBills;
            //Check if we have all the datas
            expect(mappedBills).toMatch(bill.type);
            expect(mappedBills).toMatch(bill.name);
            expect(mappedBills).toMatch(bill.status);
            expect(mappedBills).toMatch(bill.amount.toString());
            expect(mappedBills).toMatch(bill.date);
            expect(mappedBills).toMatch(Actions(bill.fileUrl));
        });
    });

    describe("When I am on Bills page but it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            //Define the html context
            const html = BillsUI({ loading: true });
            document.body.innerHTML = html;
            // Check we have the loading message
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });
    });

    describe("When I am on Bills page but back-end send an error message", () => {
        test("Then, Error page should be rendered", () => {
            //Define the html context
            const html = BillsUI({ error: "some error message" });
            document.body.innerHTML = html;
            // Check if we have the error message
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });
});

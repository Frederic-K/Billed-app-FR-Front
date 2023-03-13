/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"

import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js"

import Bills from '../containers/Bills.js';

import { bills } from "../fixtures/bills.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

import {localStorageMock} from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
/////////////////////////////////////////////////////////////////////////
// [Ajout de tests unitaires et d'intégration] : il manque la mention “expect”
/////////////////////////////////////////////////////////////////////////
      // expect(windowIcon).toHaveClass("active-icon");
      expect(windowIcon.className).toBe("active-icon");

    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

/////////////////////////////////////////////////////////////////////////
// [Ajout de tests unitaires et d'intégration]
/////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
// [Test displaying Bill with eye icon]
/////////////////////////////////////////////////////////////////////////

describe("When i click on the icon eye", () => {
  test("a modal should open displaying the invoice receipt", () => {

    $.fn.modal = jest.fn(); /// https://stackoverflow.com/questions/45225235/accessing-bootstrap-functionality-in-jest-testing

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }));

    document.body.innerHTML = BillsUI({ data: bills });

    const store = mockStore;
    const bill = new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    });
    
    const iconEye = screen.getAllByTestId("icon-eye")[0];

    const handelShowBillReceipt = jest.fn(bill.handleClickIconEye(iconEye))

    iconEye.addEventListener("click", handelShowBillReceipt);

    userEvent.click(iconEye);

    expect(handelShowBillReceipt).toHaveBeenCalled();
    // expect(screen.getByTestId("invoicereceipt")).toBeTruthy()
    expect(screen.getByText("Justificatif")).toBeTruthy();
  });
});

/////////////////////////////////////////////////////////////////////////
// [Test new Bill]
/////////////////////////////////////////////////////////////////////////
      
describe("When i click on new bill button", () => {
  test("Then new bill modal should be display", () => {

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }));

    const bill = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    });

    document.body.innerHTML = BillsUI({ data: { bills } });

    const handelShowNewBill = jest.fn((e) => bill.handleClickNewBill(e));

    const btnNewBill = screen.getByTestId("btn-new-bill");

    btnNewBill.addEventListener("click", handelShowNewBill);

    userEvent.click(btnNewBill);

    expect(handelShowNewBill).toHaveBeenCalled();
    // expect(screen.getByTestId("sendbillform")).toBeTruthy();
    expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});

/////////////////////////////////////////////////////////////////////////
// [Test d'intégration GET Bills]
/////////////////////////////////////////////////////////////////////////
      
// describe("Given I'm a user connected as Employee", () => {
//   describe("When i nav to Bills", () => {
//     test("Fetch bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.Bills);
//       await waitFor(() => screen.getByText("Mes notes de frais"));
//       expect(screen.getByTestId("tbody")).toBeTruthy();
//     });
//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills")
//       Object.defineProperty(
//         window, 
//         "localStorage", 
//         { value: localStorageMock }
//       );
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee',
//         email: "a@a"
//       }));
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.appendChild(root);
//       router();
//     });

//     test("fetches bills from an API and fails with 404 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           },
//         }})
//       window.onNavigate(ROUTES_PATH.Bills);
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 404/);
//       expect(message).toBeTruthy();
//     });

//     test("fetches messages from an API and fails with 500 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           },
//         }});
//       window.onNavigate(ROUTES_PATH.Bills)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 500/);
//       expect(message).toBeTruthy()
//     });
//   });
//   });
// });
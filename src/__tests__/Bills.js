/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from '../containers/Bills.js';
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });

      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      );

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
// [Test Bills Dashboard loading]
/////////////////////////////////////////////////////////////////////////

describe("When im connected as an Employee", () => {
  describe('When im on Dashboard page but it is loading', () => {
    test('Then loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true });

      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });
  });
});

/////////////////////////////////////////////////////////////////////////
// [Test Bills no bills to show on dashboard]
/////////////////////////////////////////////////////////////////////////

describe("When im connected as an Employee", () => {
  describe("When im on Dashboard page but no bills to display", () => {
    test("Then the action button to check the invoice receipt should not to be display", () => {
      document.body.innerHTML = BillsUI({ data: [] });

      const eyeIcon = screen.queryByTestId("icon-eye");

      expect(eyeIcon).toBeNull();
    });
  });
});

/////////////////////////////////////////////////////////////////////////
// [Test Bills backend error]
/////////////////////////////////////////////////////////////////////////

describe("When im connected as an Employee", () => {
  describe('When im on Dashboard page but back-end send an error message', () => {
    test('Then Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: "error message" });

      expect(screen.getAllByText("Erreur")).toBeTruthy();
      
      expect(screen.getByTestId("error-message")).toBeTruthy();
    });
  });
});

/////////////////////////////////////////////////////////////////////////
// [Test displaying Bill with eye icon]
/////////////////////////////////////////////////////////////////////////

describe("When i click on the icon eye", () => {

  describe("Set local storage item", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

  test("a modal should open displaying the invoice receipt", () => {

    $.fn.modal = jest.fn(); /// https://stackoverflow.com/questions/45225235/accessing-bootstrap-functionality-in-jest-testing

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    );

    document.body.innerHTML = BillsUI({ data: bills });

    const store = mockStore;
    const bill = new Bills({
      document, 
      onNavigate, 
      store, 
      localStorage: 
      window.localStorage
    });
    
    const iconEye = screen.getAllByTestId("icon-eye");
    const handelShowBillReceipt = jest.fn((icon) => bill.handleClickIconEye(icon));
    if (iconEye) iconEye.forEach((icon) => {
      icon.addEventListener("click", handelShowBillReceipt(icon));
      userEvent.click(icon);
    });

    expect(handelShowBillReceipt).toHaveBeenCalled();
    expect(screen.getByTestId("invoicereceipt")).toBeTruthy()
    expect(screen.getByText("Justificatif")).toBeTruthy();
  });
});
});

/////////////////////////////////////////////////////////////////////////
// [Test new Bill]
/////////////////////////////////////////////////////////////////////////
      
describe("When i click on new bill button", () => {

  describe("Set local storage item", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

  test("Then new bill modal should be display", () => {

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    );

    const store = "";
    const bill = new Bills({
      document, 
      onNavigate, 
      store, 
      bills: bills, 
      localStorage: window.localStorage
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
});

/////////////////////////////////////////////////////////////////////////
// [Test d'intégration GET Bills]
/////////////////////////////////////////////////////////////////////////
      
describe("Given im a user connected as Employee", () => {

  describe("Set local storage item", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    
  describe("When i nav to Bills", () => {
    test("Fetch bills from mock API GET", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });

      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const getStoreSpyOn = jest.spyOn(mockStore, "bills");

      const bills = await mockStore.bills().list();
      expect(getStoreSpyOn).toHaveBeenCalledTimes(1);
      expect(bills.length).toBe(4);
    
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });    

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {return Promise.reject(new Error("Erreur 404"))},
        }})

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {return Promise.reject(new Error("Erreur 500"))},
        }});

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy()
    });
  });
  });
});
});
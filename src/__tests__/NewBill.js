/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"

import userEvent from "@testing-library/user-event";

import NewBillUI from "../views/NewBillUI.js";

import NewBill from "../containers/NewBill.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

import {localStorageMock} from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    )
  });

  describe("When im on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.className).toBe("active-icon");
    });

    test("Then new bill form should be display", () => {      
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
      expect(screen.getByTestId('expense-type')).toBeTruthy();
      expect(screen.getByTestId('expense-name')).toBeTruthy();
      expect(screen.getByTestId('datepicker')).toBeTruthy();
      expect(screen.getByTestId('amount')).toBeTruthy();
      expect(screen.getByTestId('vat')).toBeTruthy();
      expect(screen.getByTestId('pct')).toBeTruthy();
      expect(screen.getByTestId('commentary')).toBeTruthy();
      expect(screen.getByTestId('file')).toBeTruthy();
      const errorFileType = screen.queryByTestId("message_file_type_error");
      expect(errorFileType.getAttribute("class")).toMatch(/hidden/);
    });
  });

  



});

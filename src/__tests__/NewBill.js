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

  describe("When i upload invoice receipt file", () => {

    beforeEach(() => {
      jest.clearAllMocks()
    });
    afterEach(() => {
      jest.clearAllMocks()
    });

    describe("When i upload wrong file type", () => {
      test("Then a error message is diplaying", async () => {
        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
  
        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });

        const inputFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener("change", handleChangeFile);

        fireEvent.change(inputFile, {
          target: {
            files: [new File(["receiptTest.mp4"], "receiptTest.mp4", { type: "video/mp4" })],
          }
        });
  
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].type).toBe("video/mp4");
        
        await waitFor(() => screen.getByTestId("message_file_type_error"));
        const errorFileType = screen.queryByTestId("message_file_type_error");
        expect(errorFileType.className).toBe("msg__error--filetype");
      })
    })

    describe("When i upload allowed file type", () => {
      test("Then uploaded file name is display", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
  
        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });

        const inputFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener("change", handleChangeFile);

        fireEvent.change(inputFile, {
          target: {
            files: [new File(["receiptTest.jpg"], "receiptTest.jpg", { type: "image/jpg" })],
          }
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].type).toBe("image/jpg");
        expect(inputFile.files[0]).toEqual(File)
        await waitFor(() => screen.getByTestId("message_file_type_error"));
        const errorFileType = screen.queryByTestId("message_file_type_error");
        expect(errorFileType.getAttribute("class")).toMatch(/hidden/);
      })
    })


  })
})    

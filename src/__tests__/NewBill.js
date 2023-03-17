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

import store from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

/////////////////////////////////////////////////////////////////////////
// [Ajout de tests unitaires et d'intégration]
/////////////////////////////////////////////////////////////////////////

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    );
  });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills highlighted mail icon in vertical layout]
/////////////////////////////////////////////////////////////////////////  

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

/////////////////////////////////////////////////////////////////////////
// [Test NewBills page loaded]
/////////////////////////////////////////////////////////////////////////      

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

/////////////////////////////////////////////////////////////////////////
// [Test NewBills submit incomplete receipt form]
/////////////////////////////////////////////////////////////////////////  

    describe("When i submit an incomplete expense report form", () => {
      test("Thern i should stay on NewBill page", () => {
        window.onNavigate(ROUTES_PATH.NewBill);

        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });

        expect(screen.getByTestId("expense-name").value).toBe("");
        // expect(screen.getByTestId("datepicker").value).toBe(""); // Autocheck
        // expect(screen.getByTestId("amount").value).toBe(""); // Autocheck
        expect(screen.getByTestId("vat").value).toBe("");
        // expect(screen.getByTestId("pct").value).toBe(""); // // Autocheck
        // expect(screen.getByTestId("file").value).toBe(""); // Autocheck

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
        expect(form).toBeTruthy();
        });
      });    
    });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills upload invoice receipt]
/////////////////////////////////////////////////////////////////////////   

  describe("When i upload invoice receipt file", () => {

    beforeEach(() => {
      jest.clearAllMocks()
    });
    afterEach(() => {
      jest.clearAllMocks()
    });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills upload wrong file type]
/////////////////////////////////////////////////////////////////////////       

    describe("When i upload wrong file type", () => {
      test("Then a error message is diplaying", async () => {

        // document.body.innerHTML = NewBillUI();
        const html = NewBillUI();
        document.body.innerHTML = html;

        window.onNavigate(ROUTES_PATH.NewBill);

        // const onNavigate = (pathname) => {
        //   document.body.innerHTML = ROUTES({ pathname });
        // };

        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });

        const inputFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener("change", handleChangeFile);

        const newFile = new File(["receiptTest.mp4"], "receiptTest.mp4", { type: "video/mp4" });
        userEvent.upload(inputFile, newFile);

        // fireEvent.change(inputFile, {
        //   target: {
        //     files: [new File(["receiptTest.mp4"], "receiptTest.mp4", { type: "video/mp4" })],
        //   }
        // });
  
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].type).toBe("video/mp4");
        expect(inputFile.value).toBe('');
        
        await waitFor(() => screen.getByTestId("message_file_type_error"));
        const errorFileType = screen.queryByTestId("message_file_type_error");
        expect(errorFileType.className).toBe("msg__error--filetype");

      });
    });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills upload allowed file type]
/////////////////////////////////////////////////////////////////////////    

    describe("When i upload allowed file type", () => {
      test("Then uploaded file name is display", async () => {
        // document.body.innerHTML = NewBillUI();
        const html = NewBillUI();
        document.body.innerHTML = html;

        window.onNavigate(ROUTES_PATH.NewBill);

        // const onNavigate = (pathname) => {
        //   document.body.innerHTML = ROUTES({ pathname });
        // };
        
        const newBill = new NewBill({
          document,
          // onNavigate: (pathname) => (document.body.innerHTML = ROUTES({ pathname })),
          onNavigate,
          // store: mockStore,
          store,
          localStorage: window.localStorage,
        });

        const inputFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener("change", handleChangeFile);

        const newFile = new File(["receiptTest.png"], "receiptTest.png", { type: "image/png" });
        userEvent.upload(inputFile, newFile);

        // fireEvent.change(inputFile, {
        //   target: {
        //     files: [new File(["receiptTest.png"], "receiptTest.png", { type: "image/png" })],
        //   }
        // });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].type).toBe("image/png");
        // expect(inputFile.files[0]).toEqual(File);
        expect(inputFile.files[0]).toEqual(newFile);
        await waitFor(() => screen.getByTestId("message_file_type_error"));
        const errorFileType = screen.queryByTestId("message_file_type_error");
        expect(errorFileType.getAttribute("class")).toMatch(/msg__error--filetype hidden/);
      });
    });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills upload allowed file type]
///////////////////////////////////////////////////////////////////////// 

    // describe("When i fill bill form with valid input", () => {
    //   test("Then i submit new bill", () => {
    //     const html = NewBillUI();
    //     document.body.innerHTML = html;

    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname })
    //     };

    //     const newBill = new NewBill({
    //       document,
    //       onNavigate,
    //       store: mockStore,
    //       localStorage: window.localStorage,
    //     });

    //     const testBill = {
    //     type: 'Restaurants et bars',
    //     name: 'Chez Madame HA',
    //     date: '20115-07-02',
    //     amount: 47,
    //     vat: 20,
    //     pct: 5,
    //     commentary: 'Repas séminaire CodeChallenge',
    //     fileUrl:
    //       'https://github.com/Frederic-K/Billed-app-FR-Front/blob/main/src/assets/images/20230302_soupeNikuUdon.png',
    //     fileName: 'RamenNikuUdon.jpg',
    //     status: 'pending',
    //     };

    //     screen.getByTestId('expense-type').value = testBill.type
    //     screen.getByTestId('expense-name').value = testBill.name
    //     screen.getByTestId('datepicker').value = testBill.date
    //     screen.getByTestId('amount').value = testBill.amount
    //     screen.getByTestId('vat').value = testBill.vat
    //     screen.getByTestId('pct').value = testBill.pct
    //     screen.getByTestId('commentary').value = testBill.commentary 
        
    //     newBill.fileName = testBill.fileName
    //     newBill.fileUrl = testBill.fileUrl

    //     const form = screen.getByTestId("form-new-bill");

    //     const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

    //     const handelUpdateBill = jest.fn((e) => newBill.updateBill)
    //     // const getUpdateBillSpyOn = jest.spyOn(newBill, "updateBill")
    //     // newBill.updateBill = jest.fn()

    //     form.addEventListener("submit", handleSubmit);
    //     fireEvent.submit(form);
    //     expect(handleSubmit).toHaveBeenCalled();
    //     expect(handelUpdateBill).toHaveBeenCalled();
    //     // expect(getUpdateBillSpyOn).toHaveBeenCalled();
    //     // expect(newBill.updateBill).toHaveBeenCalled();
    //   });
    // });




  });
});

/////////////////////////////////////////////////////////////////////////
// [Test d'intégration POST Bill]
/////////////////////////////////////////////////////////////////////////
/// https://stackoverflow.com/questions/44596915/jest-mocking-console-error-tests-fails

describe("Given im a user connected as Employee on new bill page", () => {
  describe("When i submit new bill", () => {
    test("fetches messages from an API and fails with 500 message error", async () => {
      beforeEach(() => {
          console.error.mockRestore();
      });
      afterEach(() => {
          console.error.mockClear();
          
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      );  
      // console.error = jest.fn()
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(mockStore, "bills");

      // Object.defineProperty(window, "localStorage", {
      //   value: localStorageMock,
      // });
      // Object.defineProperty(window, 'location', {
      //   value: { hash: ROUTES_PATH['NewBill'] },
      // })
    
      window.onNavigate(ROUTES_PATH.NewBill);

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      });

      const newBill = new NewBill({
        document, 
        onNavigate, 
        store: mockStore, 
        localStorage: window.localStorage
      });

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
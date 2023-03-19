/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"

import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";

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

  // describe("When i upload invoice receipt file", () => {

  //   beforeEach(() => {
  //     jest.clearAllMocks()
  //   });
  //   afterEach(() => {
  //     jest.clearAllMocks()
  //   });

/////////////////////////////////////////////////////////////////////////
// [Test NewBills upload wrong file type]
/////////////////////////////////////////////////////////////////////////       

    describe("When i upload wrong file type", () => {
      test("Then a error message is diplaying", async () => {

        jest.spyOn(console, 'error').mockImplementation(() => {});

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
// [Test NewBills submit new bill]
///////////////////////////////////////////////////////////////////////// 

describe("When i fill bill form with valid input", () => {
    test("Then i click on submit button nd submit fct is called", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;

      window.onNavigate(ROUTES_PATH.NewBill);

      const newBill = new NewBill({
        document, 
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      const testBill = {
        type: 'Restaurants et bars',
        name: 'Chez Madame HA',
        date: '2015-07-02',
        amount: 47,
        vat: 20,
        pct: 5,
        commentary: 'Repas séminaire CodeChallenge',
        fileUrl:
          'https://github.com/Frederic-K/Billed-app-FR-Front/blob/main/src/assets/images/20230302_soupeNikuUdon.png',
        fileName: 'RamenNikuUdon.jpg',
        status: 'pending',
        };
    
      screen.getByTestId('expense-type').value = testBill.type
      screen.getByTestId('expense-name').value = testBill.name
      screen.getByTestId('datepicker').value = testBill.date
      screen.getByTestId('amount').value = testBill.amount
      screen.getByTestId('vat').value = testBill.vat
      screen.getByTestId('pct').value = testBill.pct
      screen.getByTestId('commentary').value = testBill.commentary 
      
      newBill.fileName = testBill.fileName
      newBill.fileUrl = testBill.fileUrl

      // newBill.updateBill = jest.fn()  
      const handelUpdateBill = jest.fn((e) => newBill.updateBill(e));  

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      // expect(newBill.updateBill).toHaveBeenCalled()
      expect(handelUpdateBill).toHaveBeenCalled();      
    });
  });
});  

/////////////////////////////////////////////////////////////////////////
// [Test d'intégration POST Bills]
/////////////////////////////////////////////////////////////////////////

describe("When i submit a valid new bill", () => {
  test("Fetch new bills to mock API POST", async () => {
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();

    jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
      return {
        create: () => {
          return Promise.resolve();
        },
      };
    });

    window.onNavigate(ROUTES_PATH.NewBill);
    await new Promise(process.nextTick);
    await waitFor(() => screen.getByText("Mes notes de frais"));
    expect(screen.getByTestId("tbody")).toBeTruthy();
  });
// });

test("Fetch new bills to mock API POST", async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // const root = document.createElement("div");
  // root.setAttribute("id", "root");
  // document.body.appendChild(root);
  // router();

  const html = NewBillUI();
  document.body.innerHTML = html;

  jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
    return {
      create: () => {
        return Promise.reject();
      },
    };
  });

  window.onNavigate(ROUTES_PATH.NewBill);
  expect(console.error).toBeCalled();
});
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
  })

  test("Fetches bills to an API and fails with 401 message error", async () => {
    //https://developer.mozilla.org/fr/docs/Web/HTTP/Status/401
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 401"));
        },
      };
    });
    
    const html = BillsUI({ error: "Erreur 401" });
    document.body.innerHTML = html;
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 401/);
    expect(message).toBeTruthy();
  });

  test("Fetches bills to an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy(); 
  });

  test("Fetches bills to an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy(); 
  });
});  

////////////////////////////////////////////////////////////////////////

// console.error = jest.fn()
// jest.spyOn(console, 'error').mockImplementation(() => {});
// expect(console.error).toBeCalled();

////////////////////////////////////////////////////////////////////////

// Object.defineProperty(window, 'location', {
//   value: { hash: ROUTES_PATH['NewBill'] },
// })

// expect(console.error).toBeCalled();


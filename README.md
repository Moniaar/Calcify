# Calcify
Pharmacy POS system using Electron.js for frontend and sqlite3 and Express for backend!. 

   ![icon](https://github.com/user-attachments/assets/f6f0bb7b-15a5-4d9d-a70f-4fa3db524906)

---

This project was designed to help a pharmacy track the following:
1. Sales
2. Customers informations are stored after selling
3. Creating invoices & printing them
4. Managing different storage areas 
5. Creating stocks with a database for each product
6. Medication database


---
## Things I have learned while building with Electron

1. Electron has 2 separate processes one for main and one is a renderer process. Main is based on node dealing with your computer hardware and need to be kept secure, the renderer one is for UI only. You need to debug seaperatly for each one.
2. Your database connection will be a pain to set up if you don't understand some concepts:


3. How can we actually fully connect front-end to this database?


4. In main.js, ipcRenderer isn’t available—it’s for the renderer process. This will cause a syntax error or runtime error (ipcRenderer is not defined).

In next version I will update with the ability to backup automatically each 5min 😃. 




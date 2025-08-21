The following page currently displays the static version of the financial intelligence dashboard.

In order for the dashboard to function properly, you must download it and run it on Live Port: 8080 using VSCode or any other IDE. 

The financial inputs for the dashboard contain lots of dead numbers, primarily because the dashboard was built for my own personal use. 

If you'd like to customize it for your own usage, refer first to globals.js, and then update-financials.js and edit one or more of the following: 
update-financials.js:
- fixedCapital: This is the amount of money you currently have, not including any of the future income you're going to receive. For example, if you already have $1,900 saved in a chequing account, you can edit this number in to accurately reflect your account balance.
globals.js
- existingFHSA: Assuming you have a TFSA, FHSA, or any other compound interest savings account, you can edit your account's existing balance here.
- existingRRSP: Assuming you may have a RRSP or 401k plan, you can edit your RRSP & 401ks existing balance here. 

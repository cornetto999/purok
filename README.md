# Community Manager

Act as an expert React frontend developer. I want to build a Resident and Household Management System to replace an existing Excel tracker. 

Tech Stack: React, Tailwind CSS, Lucide React (for icons), and standard React Hooks (useState, useMemo).

1. DATA MODEL (Mock Data Structure):

Create a mock database (JSON/Array of objects) based on this relational structure:

- Purok: { id, name, purokLeaderName }

- Household: { id, purokId, householdLeaderName, address }

- Member: 

  { 

    id, 

    householdId, 

    fullName (combining Last, First, Middle), 

    pn (Precinct Number), 

    age, 

    religion, 

    civilStatus, 

    isSC (boolean - Senior Citizen), 

    isPWD (boolean - Person with Disability), 

    isIP (boolean - Indigenous Person), 

    remarks 

  }

2. COMPONENTS TO BUILD:

- App Layout: A simple sidebar or top navigation with a clean dashboard feel.

- Dashboard Overview: Cards showing "Total Puroks", "Total Households", and "Total Members".

- Data Table Component (The core feature):

  - Build a comprehensive table that displays the Members.

  - Columns should include: Name, Precinct No. (PN), Purok, Household Leader, Age, Status, Special Sectors (SC/PWD/IP tags or icons), and Remarks.

  - Implement a search bar to filter by Name or Precinct Number (similar to the Excel filter feature).

  - Implement dropdown filters for "Purok" and "Special Sector" (SC/PWD/IP).

- Details Modal/Panel: When clicking on a member row, show a slide-out panel or modal displaying their full data, including who their Purok Leader and Household Leader are.

3. UI/UX GUIDELINES:

- Use a clean, modern, administrative interface (white/gray background, distinct table headers).

- Style the table to be compact and easy to read, mimicking the data density of an Excel spreadsheet but with modern web styling.

- Use Tailwind badges/pills for the SC, PWD, and IP statuses (e.g., SC = blue pill, PWD = green pill, IP = orange pill).

Please generate the complete, functioning React code (in one or multiple files depending on your platform) so I can copy-paste and run it immediately.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f9013ff2-b488-4aaf-be5f-105ea2c90f61).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

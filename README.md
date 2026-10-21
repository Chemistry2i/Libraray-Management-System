# Kamuli CU Library Management System

Kamuli CU Library is the library service for **Kamuli Church of Uganda Primary School**. This educational project explores how the school library can bring its services and learning resources into one digital place. It combines a familiar book catalogue with a **Digital Archive** where people can discover digitized photographs, documents, reports, and other publications.

This project is an exercise and demonstration, not a finished product for every library. Its main idea is simple: make library information easier to organize, find, and access, while giving staff a way to manage both books and digital materials.

## The digital idea

The Digital Archive is a central part of the project. Library staff can group files into collections, enter per-object Dublin Core metadata (including title, creator, date, subject, description, type, format, identifier, and language), review rights information, and choose whether an item is available to the public. Visitors can search and filter public items, view their descriptive metadata, preview supported files, and download them.

The archive organizes materials that have already been digitized; it does not scan paper records or turn physical books into digital files. Supported uploads include common document, image, audio, and video formats.

## What people can do

- **Readers and visitors:** browse and search the book catalogue, explore public archive collections, and view or download available digital items.
- **Library members:** create an account, manage their profile, borrow and reserve books, and keep track of library activity.
- **Library staff:** manage books, categories, members, borrowing, reservations, and digital collections.
- **Administrators:** use dashboards and reports to oversee library activity and archive access.

Features available to members and staff depend on their account and permissions.

## A simple example

1. Staff create a collection, such as “School Newsletters.”
2. Staff add a digitized file and describe it, including its title and creator.
3. Staff record a rights assessment and decide whether the item can be public.
4. A visitor searches the Digital Archive, opens an available item, and views or downloads it.

This illustrates the project’s digital-creation focus: turning existing digital materials into an organized, discoverable resource.

## Technology overview

The application has a web interface and a server that stores and manages information:

- **Frontend:** React, Vite, and Tailwind CSS
- **Backend:** Node.js and Express
- **Database:** MySQL
- **Optional file storage:** Cloudinary, with private local storage available for development

## Run locally

You will need Node.js, npm, and a MySQL database. The backend also needs environment settings for the database and authentication.

1. Create a MySQL database and load the schema. For a new, empty database, see the instructions for the consolidated schema in [`backend/tables/README.md`](backend/tables/README.md). Do not use the fresh-install schema on an existing database.
2. Copy `backend/.env.example` to `backend/.env` and set the database connection values for your local MySQL database, `NODE_ENV=development`, and a private `JWT_SECRET`. Then install dependencies and start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL=http://localhost:5000/api` for local development. Then install dependencies and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open the local address printed by Vite (typically `http://localhost:5173`). The frontend needs the backend API to be running and correctly configured.

For more detailed setup and deployment guidance, see [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## Presenting the project

The presentation documents are organized around the Group 2 **Mini Digital Collection** and **Digitization Workflow** assignment. [`PRESENTATION_GUIDE.md`](PRESENTATION_GUIDE.md) outlines the talk, [`SLIDE_CONTENT_GUIDE.md`](SLIDE_CONTENT_GUIDE.md) provides the 25 slide contents and speaker notes, and [`POWERPOINT_BUILD_GUIDE.md`](POWERPOINT_BUILD_GUIDE.md) gives the slide order, layouts, diagrams, and preparation work.

The Digital Collections staff workflow supports per-object Dublin Core metadata entry and CSV export. Existing installations need the one-time migration described in [`backend/README.md`](backend/README.md).

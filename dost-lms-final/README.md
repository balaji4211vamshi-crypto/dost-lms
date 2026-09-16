# DOST Academy System

## Project Overview

DOST Academy System is a centralized Learning Management System (LMS) prototype developed for the Department of Science and Technology (DOST). The system is designed to support employee training, course access, assignment tracking, certificate management, and learning progress monitoring.

This Phase 1 submission includes a working React frontend prototype with employee and admin interfaces. Backend integration, database connection, secure authentication, and LMS integration are planned for Phase 2.

## Team Details

**Team Name:** Team 59 (AstraLink)  
**Unit:** IFN735 – Industry Project Phase 1  
**Project Title:** DOST Academy System  
**Industry Partner:** Department of Science and Technology (DOST)

## Technologies Used

### Frontend
- React JS
- React Router DOM
- JavaScript ES6
- Inline CSS styling
- Component-based page structure

### Planned Backend for Phase 2
- Laravel PHP Framework
- MySQL Database
- REST APIs
- Role-Based Access Control
- Secure authentication

## Main Features Delivered in Phase 1

### Employee Side
- Public Home / Landing Page
- Login and Signup Page
- User Landing Page
- Employee Dashboard
- Department-Based Courses Page
- Course Details Page
- Assignments Page
- Certificates Page
- Edit Profile Page

### Admin Side
- Admin Dashboard
- Manage Users Page
- Manage Courses Page
- Manage Assignments Page
- Manage Certificates Page
- Progress Reports Page

## Main Routes

```text
/                         Public Home Page
/login                    Login / Signup Page
/user-home                User Landing Page
/dashboard                Employee Dashboard
/courses                  Courses Page
/course-details           Course Details Page
/assignments              Assignments Page
/certificates             Certificates Page
/edit-profile             Edit Profile Page

/admin-dashboard          Admin Dashboard
/manage-users             Manage Users Page
/manage-courses           Manage Courses Page
/manage-assignments       Manage Assignments Page
/manage-certificates      Manage Certificates Page
/progress-reports         Progress Reports Page
```

## How to Run the Project

### Step 1: Open the Project

Open the project folder in Visual Studio Code.

### Step 2: Install Dependencies

Run this command in the terminal:

```bash
npm install
```

### Step 3: Start the React Application

Run:

```bash
npm start
```

### Step 4: Open in Browser

The application will open at:

```text
http://localhost:3000
```

## Important Notes

- This is a Phase 1 frontend prototype.
- The current prototype uses static/sample data.
- Login and signup are for prototype demonstration only.
- Real backend authentication is planned for Phase 2.
- Course data, assignment data, certificate data, and progress reports will be connected to a Laravel backend and MySQL database in Phase 2.
- LMS integration is planned for Phase 2 after API access and data requirements are confirmed with the client.

## Image Credits

Some interface images used in the prototype are sourced from Unsplash and are used for demonstration/prototype purposes only.

Reference:  
Unsplash. (n.d.). Free images and pictures. https://unsplash.com/

## Phase 2 Planned Work

The following work is planned for Phase 2:

- Set up Laravel backend
- Create MySQL database
- Implement secure login and signup
- Add role-based access control
- Build APIs for users, courses, assignments, certificates, and progress reports
- Replace static frontend data with database-driven data
- Add content upload support
- Add quiz/result storage
- Add automated certificate generation
- Integrate with the existing LMS if API access is provided
- Perform functional, integration, and user testing

## Submission Contents

The IT artefacts ZIP should include:

```text
00_Cover_Letter_IT_Artefacts.docx
01_User_Stories.docx
02_Design_Document.docx
03_Test_Results.docx
04_Implementation_Plan.docx
README.md
React frontend source code
Screenshots folder
```

## Status

**Phase 1 Status:** Frontend prototype completed  
**Phase 2 Status:** Backend, database, authentication, and LMS integration planned

What'sUp TKM 🎯

Basic Details<br><br>
Team Name: 404 Jeevitham<br><br>
Team Members

  Member 1: Adwitha Nair - TKM College of Engineering

  Member 2: Neeta A Suresh - TKM College of Engineering

Project Description

Whatsup TKM is a high-engagement campus event portal that replaces traditional list-based discovery with a Tinder-style swipe interface. It centralizes event registration, ticket reselling, and campus-wide community discussions into a single "Obsidian" themed web app.
The Problem statement

Campus engagement is currently fragmented across cluttered WhatsApp groups and outdated notice boards. This lead to students missing out on events, low participation rates, and a lack of a central marketplace for peer-to-peer resource sharing like ticket reselling.
The Solution

We solve this by providing a "Swipe-to-Register" discovery engine that makes finding events fun. We've also integrated a robust Community Pillar (Lost & Found,  Discussions) and a Management Suite for Club Organizers to book classrooms and track live event analytics.
Technical Details
Technologies/Components Used

For Software:

  Languages used: JavaScript (ES6+)

   Frameworks used: React.js, Node.js, MongoDB

  Libraries used: react-tinder-card (Swipe Engine), axios (API calls), jsonwebtoken (Auth), lucide-react (Icons), mongoose (Database ODM)

   Tools used: VS Code, Git/GitHub, MongoDB Atlas, Postman

Features

Key features of your project:

  Tinder-Style Discovery: Swipe right to register for campus events or left to skip.

  Role-Based Access Control (RBAC): Distinct interfaces for Students, Execom members (via Club Codes), and Club Organizers.

  Smart Asset Mapping: A conflict-free classroom booking system for organizers to reserve venues.

  Community Hub: Integrated boards for Lost & Found, peer-to-peer Ticket Reselling, and General Discussions.

  Live Operations Dashboard: Real-time analytics for Execom to track registrations, revenue, and attendee lists.

Implementation
For Software:
Installation
Bash

# Clone the repository
git clone https://github.com/adwitha2305/whatsup-tkm.git

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install

Run
Bash

# Run Backend (from server folder)
node index.js

# Run Frontend (from client folder)
npm start

Project Documentation
For Software:
Screenshots (Add at least 3)

The main Discovery Engine where students swipe through event cards.

Live Analytics view showing registration counts and attendee data.

The Community Hub featuring Lost & Found and Ticket Resell listings.
Diagrams

System Architecture:
The app follows the MERN stack architecture. React handles the frontend state via Context API. Node acts as the middleware handling JWT authentication and classroom conflict logic, communicating with MongoDB for persistent storage of users, events, and bookings.
Additional Documentation
For Web Projects with Backend:
API Documentation

Base URL: http://localhost:5000
Endpoints

POST /api/users/signup

    Description: Registers a new user. If a valid clubCode is provided, user is assigned the 'execom' role.

    Response:

JSON

{
  "token": "jwt_token_here",
  "user": { "username": "JohnDoe", "role": "student" }
}

GET /api/events/all

    Description: Fetches all upcoming events for the Swipe UI.

    Response:

JSON

{
  "status": "success",
  "data": [ { "title": "Tech Fest", "location": "CS-101", "price": 100 } ]
}

Project Demo
Video

[Link to your Loom/YouTube demo video]

The video demonstrates a student swiping through events, registering, an organizer booking a classroom, and the Execom member viewing the live attendee list.
AI Tools Used (Optional)

Tool Used: Gemini / ChatGPT

Purpose: - Debugging classroom booking conflict logic.

  Generating boilerplate Mongoose schemas.

  Designing the Obsidian dark-theme CSS palette.

Percentage of AI-generated code: 20%

Human Contributions:

  Architecture design and UI/UX flow.

  Implementation of the Tinder Swipe logic.

  Custom Business logic for Ticket Reselling and Club Code verification.

Team Contributions
[Member 1]:Developed the JWT-based authentication system with role-assignment, the custom "Obsidian" dark-theme UI architecture, and the Tinder-style "Swipe-to-Register" discovery interface using the react-tinder-card library.Tinder Swipe UI implementation, UI/UX design (Obsidian Theme),lost and found and Community page .

[Member 2]: Built the smart classroom booking system with conflict detection,Event Organisation section and  the Live Ops analytics dashboard.

License

This project is licensed under the MIT License - see the LICENSE file for details.

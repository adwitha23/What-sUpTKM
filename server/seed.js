// server/seedEvents.js
const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const dummyEvents = [
  {
    title: "Advay 2026",
    description: "The biggest tech fest of the year. Join us for innovation.",
    date: new Date('2026-03-15'),
    location: "Main Auditorium",
    organizer: "College Union",
    category: "Technical",
    image: "https://images.unsplash.com/photo-1540575861501-7ad05823c23d?q=80&w=400&h=600&auto=format&fit=crop"
  },
  {
    title: "Hack-A-Thon",
    description: "24 hours of non-stop coding and problem solving.",
    date: new Date('2026-04-10'),
    location: "IT Lab",
    organizer: "Coding Club",
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400&h=600&auto=format&fit=crop"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Event.deleteMany({}); // Clear old events
    await Event.insertMany(dummyEvents);
    console.log("Dummy events added!");
    process.exit();
  });
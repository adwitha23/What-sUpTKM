const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const dummyEvents = [
  {
    title: "Advay 2026",
    description: "The biggest tech fest of the year. Join us for innovation, workshops and competitions.",
    date: new Date('2026-03-15'),
    time: "10:00 AM - 6:00 PM",
    location: "Main Auditorium",
    organizer: "College Union",
    category: "Technical",
    image: "https://images.unsplash.com/photo-1540575861501-7ad05823c23d?q=80&w=400&h=600&auto=format&fit=crop",
    ticketPrice: 0,          // free
    maxCapacity: 800
  },
  {
    title: "Hack‑A‑Thon",
    description: "24 hours of non-stop coding and problem solving. Teams of 4, prizes for winners.",
    date: new Date('2026-04-10'),
    time: "6:00 PM (Fri) – 6:00 PM (Sat)",
    location: "IT Lab",
    organizer: "Coding Club",
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400&h=600&auto=format&fit=crop",
    ticketPrice: 100,        // paid
    maxCapacity: 200
  },
  {
    title: "Art & Culture Night",
    description: "An evening of music, dance and drama showcasing campus talent.",
    date: new Date('2026-05-05'),
    time: "7:00 PM onwards",
    location: "Open Air Theatre",
    organizer: "Cultural Club",
    category: "Cultural",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&h=600&auto=format&fit=crop",
    ticketPrice: 50,
    maxCapacity: 500
  },
  {
    title: "Guest Lecture: AI in 2026",
    description: "Talk by Dr. S. Reddy on the future of artificial intelligence.",
    date: new Date('2026-06-20'),
    time: "11:00 AM - 1:00 PM",
    location: "Seminar Hall 2",
    organizer: "Electronics Dept.",
    category: "Lecture",
    image: "https://images.unsplash.com/photo-1581091012184-7b3c5e6dee99?q=80&w=400&h=600&auto=format&fit=crop",
    ticketPrice: 0,
    maxCapacity: 300
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Event.deleteMany({});
    await Event.insertMany(dummyEvents);
    console.log("Dummy events added!");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
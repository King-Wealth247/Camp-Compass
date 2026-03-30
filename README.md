# Camp-Compass

A campus management web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

It provides role-based dashboards for students, staff, registrars, and admins to manage halls, timetables, availability, notifications, and campus maps — all from a single platform.

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework with file-based routing
- [TypeScript](https://www.typescriptlang.org/) — static typing
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling
- [Radix UI](https://www.radix-ui.com/) — accessible headless components
- [Recharts](https://recharts.org/) — data visualization
- [React Hook Form](https://react-hook-form.com/) — form management

---

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/King-Wealth247/Camp-Compass.git
cd Camp-Compass
```

### 2. Install dependencies

```bash
cd camp-compass
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

---

## Project Structure

```
camp-compass/
├── src/
│   ├── app/
│   │   ├── dashboard/        # Role-based dashboard pages
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   ├── staff/
│   │   │   ├── registrar/
│   │   │   ├── halls/
│   │   │   ├── timetable/
│   │   │   ├── availability/
│   │   │   ├── map/
│   │   │   └── notifications/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # React context (auth, etc.)
│   │   └── data/             # Mock data
│   ├── components/           # Global components
│   └── styles/               # Global styles
└── public/                   # Static assets
```

---

## Contributing

This project is under active development. More features and documentation will be added progressively.

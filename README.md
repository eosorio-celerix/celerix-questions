# Project Celerix

A scalable Angular 20 application featuring a comprehensive user registration form built with Angular Material and following Angular best practices.

## Features

- **Reactive Forms**: Built with Angular Reactive Forms for better control and validation
- **Angular Material**: Modern UI components using Angular Material Design
- **Scalable Architecture**: Feature-based architecture with modular structure
- **Form Validation**: Custom validators for phone numbers, identity documents, and names
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Type Safety**: Full TypeScript support with strict typing

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── models/             # Data models and interfaces
│   │   ├── services/           # Shared services
│   │   └── validators/         # Custom validators
│   ├── features/               # Feature modules
│   │   └── form/              # Form feature
│   │       └── components/    # Form components
│   ├── shared/                # Shared modules and components
│   └── app.component.ts       # Root component
├── assets/                     # Static assets
└── styles.scss                # Global styles
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser.

## Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Form Fields

The form includes the following fields:
- Full Name (required, validated)
- Identity Document (required, validated)
- Birth Date (required)
- Birth Place (required)
- Email (required, email validation)
- City (required)
- Country (required, dropdown selection)
- Phone Number (required, validated)

## Technologies Used

- Angular 20
- Angular Material
- TypeScript
- RxJS
- SCSS

## Best Practices Implemented

- Standalone components for better tree-shaking
- Feature-based architecture for scalability
- Reactive forms with custom validators
- Service-based data management
- Type-safe models and interfaces
- Responsive design patterns
- Error handling and user feedback


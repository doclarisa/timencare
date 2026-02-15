# Expo Session Calendar App

This project is a mobile application built with React Native and Expo, designed to provide a session timer and calendar functionality. It works offline on both Android and iOS devices.

## Project Structure

- **src**: Contains the main application code.
  - **App.tsx**: Entry point of the application, sets up navigation.
  - **screens**: Contains screen components.
    - **SessionTimerScreen.tsx**: Displays the session timer and controls.
    - **CalendarScreen.tsx**: Displays a calendar view of scheduled events.
  - **components**: Contains reusable components.
    - **TimerControls.tsx**: Buttons for clocking in and out.
    - **SessionCard.tsx**: Displays current session details.
    - **CalendarView.tsx**: Renders the month grid and events.
  - **navigation**: Contains navigation setup.
    - **index.tsx**: Defines the navigation structure.
  - **hooks**: Custom hooks for managing state and side effects.
    - **useTimer.ts**: Manages countdown timer logic.
    - **useOfflineSync.ts**: Handles local storage and syncing.
  - **services**: Contains functions for data management.
    - **storage.ts**: Manages local storage using SQLite.
    - **calendarService.ts**: Manages calendar events.
  - **store**: Centralized state management.
    - **index.ts**: Manages session and calendar data.
  - **types**: TypeScript types and interfaces.
    - **index.ts**: Defines event types and session states.
  - **utils**: Utility functions.
    - **date.ts**: Date manipulation functions.

- **assets**: Contains custom fonts used in the application.

- **package.json**: Configuration file for npm, listing dependencies and scripts.

- **tsconfig.json**: TypeScript configuration file.

- **app.json**: Configuration settings for the Expo app.

- **babel.config.js**: Babel configuration settings.

- **.eslintrc.js**: ESLint configuration settings.

## Setup Instructions

1. Install Node.js and Expo CLI if not already installed.
2. Clone the repository or create a new directory and navigate into it.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the Expo development server.
5. Use the Expo Go app on your mobile device to scan the QR code and run the app.

## Testing Checklist

- Verify that the timer triggers correctly at the scheduled start and end times.
- Check that the repeated buzz cancels when the user acknowledges the notification.
- Test offline event CRUD operations to ensure they work reliably without network access.
- Confirm that the PIN lock functions correctly on app launch and after backgrounding the app.
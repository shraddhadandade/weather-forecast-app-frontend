Setup Instructions

1. Clone the repo
   git clone https://github.com/shraddhadandade/weather-forecast-app-frontend.git
   cd weather-forecast-app-frontend

2. Backend Setup
   cd backend
   npm install

3. Create a .env file inside backend/:

   PORT=5000
   MONGO_URI=mongodb+srv://shraddhadandade07:weatherApp123@weatherapp.83e8xhc.mongodb.net/?retryWrites=true&w=majority&appName=weatherApp
   OPENWEATHER_API_KEY=e2a0362ed7754bbd89a1bfcb42b7709e

4. Run the backend:
   npm start # or nodemon server.js if nodemon is installed

5. Frontend Setup
   cd frontend
   npm install
   npm run dev

# NotificationService
A RESTful API service that sends notifications to users through multiple channels (email, SMS, and in-app) with retry capabilities.

Features:\
-RESTful API for creating and retrieving notifications\
-Support for multiple notification types (email, SMS, in-app)\
-Automatic retry mechanism with exponential backoff\
-Containerized with Docker for easy deployment\
-Detailed status tracking for notifications

Prerequisites:\
-Node.js (v14 or higher)\
-Docker (optional, for containerized deployment)

Setup Instructions:
-Local Development Setup\
-Clone this repository or create a new directory\
mkdir notification-service\
cd notification-service\
-Create the application files\
Create app.js - The main application file\
Create package.json - Project configuration\
Create .dockerignore - Docker build exclusions\
Create Dockerfile - Docker container configuration\
-Install dependencies\
npm install\
-Run the application\
npm run dev\
-Access the API\
-The service will be available at http://localhost:3000

Assumptions and Implementation Notes:\
In-memory Storage: Notifications are stored in memory. In a production environment, a database would be required.\
Simulated Sending: The service simulates notification sending with random success/failure to demonstrate the retry mechanism. In production, we would integrate real notification providers.\
No Authentication: The API does not implement authentication. In a production environment, secure access controls would be necessary.\
Local Environment: The service is designed to run locally or in a container. For public internet access, additional configuration is needed.\
Simplification: Queue-based architecture has been simplified to run without external dependencies. A production system would use a proper message queue.


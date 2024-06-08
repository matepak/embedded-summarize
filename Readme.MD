# EmbeddedSummarize

## Overview

EmbeddedSummarize is a web service designed to fetch web content from a given URL, process it to remove unnecessary elements, and generate a concise summary. It includes features such as user authentication, rate limiting, and caching to improve performance and security.

## Features

- **User Authentication:** Register and login using JWT for secure access.
- **Content Fetching:** Fetch web content using Axios and process it with Cheerio.
- **Summarization:** Identify important text chunks using cosine similarity and summarize them.
- **Rate Limiting:** Prevent abuse by limiting the number of requests per IP.
- **Caching:** Cache summaries to improve performance and reduce repeated processing.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/matepak/embeddedsummarize.git
   cd embeddedsummarize
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables. Create a .env file in the root directory and add:

   ```text
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=openai_api_key
   ```

4. Initialize the SQLite database:

   ```bash
   npx sequelize-cli db:migrate
   ```

### Running the Application

1. Start the server:

   ```bash
   npm start
   ```

2. The server will be running at http://localhost:3000.

## API Endpoints

### Authentication

- Register: POST /register

  - Request body: { "username": "your_username", "password": "your_password" }
  - Response: 201 Created on success

- Login: POST /login
  - Request body: { "username": "your_username", "password": "your_password" }
  - Response: { "token": "jwt_token" } on success
- Summarization
  - Summarize Content: POST /summarize
  - Headers: Authorization: Bearer jwt_token
  - Request body: { "url": "http://example.com" }
  - Response: 200 OK with summarized content

## Project Structure

```bash
.
├── config/
│   └── config.json          # Database configuration
├── controllers/
│   └── authController.js    # Authentication logic
├── middlewares/
│   ├── jwtAuth.js           # JWT authentication middleware
│   └── rateLimiter.js       # Rate limiting middleware
├── models/
│   └── User.js              # User model definition
├── routes/
│   ├── auth.js              # Authentication routes
│   └── summarize.js         # Summarization routes
├── tests/
│   ├── jwtAuth.test.js      # Tests for JWT authentication middleware
│   └── rateLimiter.test.js  # Tests for rate limiting middleware
├── utils/
│   └── logger.js            # Logger utility
├── .env                     # Environment variables
├── .gitignore               # Files to be ignored by Git
├── package.json             # Project metadata and dependencies
├── README.md                # Project documentation
└── server.js                # Entry point of the application
```

## Testing

To run tests, use the following command:

```bash
npm test
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

License MIT

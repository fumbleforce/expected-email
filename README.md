# Expected email

This little service allows users send scheduled emails. After registering their transport (SMTP server, email, user, password), they can create emails in this service, and decide when they are sent. A loop runs in the background to send off emails when they need to be sent.
  
The client uses next.js + react
The server uses express

## Installation

1. Install mongodb to use as a local test db
2. `npm install`
3. `npm run mongo-server`
4. `npm run dev`
5. Optionally you can make a .env file, example included, to add connections to server email host and mongo db host

# Version1 Chat App

A real-time chat application built with React.js (Vite), TailwindCSS, TanStack Query, Redux Toolkit, and Redux Persist for the frontend. The backend is powered by Nest.js, MongoDB, Prisma, Cloudinary, and includes Swagger API documentation. The app supports group chats, public channels, private groups, message variations, and more.


### Features

- **Group Chatting**: Supports both public channels and private groups.
- **Real-Time Communication**: Utilizes Socket.io for live message updates.
- **Push Notifications**: Implemented with web push for notifying users even when the app is closed or in kill mode.

## Installation

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/shkwahab/chatappUi
   cd chatappUi
   ```
2. Install the dependency if you dont have pnpm package manage than follow this setup:

    ```bash
    npm i -g pnpm
    pnpm i
    ```   
   Otherwsie:
   ```bash
   pnpm i
   ```
3. Create an .env file in the root directory with the following content and replace the keys according to your requirements:
```bash


VITE_BASE_URL                     =    "https://apichat.chickenkiller.com"
VITE_SOCKET_BASE_URL              =    "https://socketchat.chickenkiller.com"
VITE_SOCKET_MESSAGES_BASE_PATH    =    "/messages"
VITE_SOCKET_ROOMS_BASE_PATH       =    "/rooms"

```

4. Start the application:

Dev Environment:

```bash
pnpm dev
```


## Swagger API Documentation

Run the server visit: [https://apichat.chickenkiller.com/api-docs](https://apichat.chickenkiller.com/api-docs/)
Here is the Backend App Github Repo visit: [Backend App](https://github.com/shkwahab/chatappbackendnestjs)

### Notifications

- **Subscribe**: Adds a new subscriber to the notification system.
- **Send Notification**: Sends a push notification to all subscribers.

### Group Chatting

- **Public Channels**: Channels where anyone can join and chat.
- **Private Groups**: Groups where only authorized members can join.


### App Preview

<img src="/public/assets/preview/login.png">
<img src="/public/assets/preview/register.png">
<img src="/public/assets/preview/preview.png">
<img src="/public/assets/preview/addChatRoom.png">
<img src="/public/assets/preview/roomDetail.png">
<img src="/public/assets/preview/profiletTab.png">
<img src="/public/assets/preview/roomDetailAdminPopup.png">
<img src="/public/assets/preview/sendInvitation.png">
<img src="/public/assets/preview/updateChatRoom.png">
<img src="/public/assets/preview/deleteRoomChat.png">
<img src="/public/assets/preview/leaveRoomPopup.png">
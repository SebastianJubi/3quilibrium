# 3QUILIBRIUM

Maintain balance between the 3 essentials - work, life and health

## Overview

3QUILIBRIUM is a web / mobile app which helps you to maintain
balance between the 3 essentials - work, life and health.
During this recent pandemic everything has changed drastically
including our working environment. With these new ways of
working (remote, hybrid, office) coming to light, it has
increasingly become difficult for the employees to manage their
work, life and health seamlessly. With this new app now
organizations can prioritize their employees well-being without
compromising on their productivity.

## Features

- Set your own colour scheme depending on your company's colour theme
- Customizable settings -
  - Office work timings
  - Lunch & Snack breaks
  - Meditation
- Stop your employees from skipping meditation by daily new meditation material and smart policies
- Chat with your colleague at work
- Set reminders for important events
- Receive reminders for water, lunch and snack break
- Break long stretch of work into short session using famous Italian Pomodoro Technique
- Enjoy songs and games when you get tired
- Stop work from invading your personal life, automatically pause office notifications after work hours. Send SOS messages incase of emergencies.

## Installation

Requires [Node.js](https://nodejs.org/),
[MongoDB](https://www.mongodb.com/) and
[Redis](https://redis.io/)

Download and install the dependencies.

```sh
git clone https://github.com/SebastianJubi/3quilibrium.git
cd 3equilibrium
npm i
```

## Setup

Copy contents of `.env-example` file to `.env-dev` for developmen
or `.env` for production.

```env
PORT = 8080
IP = 127.0.0.1
DB_URL = mongodb://localhost:27017/3quilibrium
ACL = true
REDIS_HOST = 127.0.0.1
REDIS_PORT = 6379
REDIS_USER = default
REDIS_PASSWORD = password
COOKIE_NAME = connect.sid
SESSION_SECRET = $e$$!0n_p@$$w0rd
BASE_URL = https://localhost:8080
COMPANY_LOGO = https://localhost:8080/shared/medias/innovaccer.png
```

- `PORT`: Port on which the server should listen
- `IP`: IP Address for starting the server
- `DB_URL`: MonngoDB url for storing of persistence data
- `ACL`: Set this value `true`/`false` depending implementation of Access Control List in Redis
- `REDIS_HOST`: IP Address of the Redis server
- `REDIS_PORT`: Port Number on which Redis is running
- `REDIS_USER`: Redis username, if ACL is true
- `REDIS_PASSWORD`: Redis password, if ACL is true
- `COOKIE_NAME`: Name by which cookie would be stored in the browser
- `SESSION_SECRET`: Secret key for read/write of cookies
- `BASE_URL`: The base url for the app, including the NGINX route (eg. `https://example.com/my-app`)
- `COMPANY_LOGO`: URL for the brand logo that would be used inside the app

## Deployment

_**For Development**_

```sh
node server.js
```

_**For Production**_

Using [PM2](https://pm2.keymetrics.io/)

```sh
pm2 start server.js --name 3equilibrium-app -- production
```

## Usage

Start the server, open browser and go to the url: http://localhost:8080/

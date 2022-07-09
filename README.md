# blog-api

Simple blogging REST API.

## Made with

- NodeJs
- Express
- MongoDB

## Deployment

You need to provide 2 env varibles `TOKEN_SECRET` and `MONGO_URI` for the app to work correctly.

- `TOKEN_SECRET`: Use to encrypt & decrypt the JWT (JSON Web Token)
- `MONGO_URI`: Host address of your MongoDB instance

## Endpoint

- **POST** `/admins/signup`<br>
  Signup a new accout

  ```json
  {
  	"fullName": "Hung Duong Quang",
  	"username": "username",
  	"password": "password"
  }
  ```

- **POST** `/admins/login`<br>
  Login using username and password

  ```json
  {
  	"username": "username",
  	"password": "password"
  }
  ```

- **GET** `/posts`<br>
  Return a list of blog posts

- **POST** `/posts`<br>
  Create a new blog posts

  ```json
  {
  	"title": "Blog's title",
  	"content": "Pending...",
  	"publishStatus": false
  }
  ```

- **GET** `/posts/:postId`<br>
  Return a single blog post

- **PUT** `/posts:postId`<br>
  Update a single blog post

  ```json
  {
  	"title": "Blog's title",
  	"content": "Pending...",
  	"publishStatus": true
  }
  ```

- **DELETE** `/posts:postId`<br>
  Delete a single blog post

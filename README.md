# blog-api

## Made with these technologies

- NodeJs
- Express
- MongoDB
- PassportJs

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

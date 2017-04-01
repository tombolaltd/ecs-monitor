# ECS monitor

A simple monitoring solution which gives you insight into your EC2 Container Service (ECS) clusters, services and container logs. The main focus around this application is to aggregate cluster and service stats so that they can be monitored in one place, without having to click around - Making it useful to put on a [telley](http://www.urbandictionary.com/define.php?term=Telley) for the team. 

As well as aggregation, ECS monitor also offers various features over and above the Amazon Console - Such as _Task churn_, which detects when a service is misbehaving by rapidly starting and stopping tasks.

<img src="https://cdn.worldvectorlogo.com/logos/react.svg" height="50" title="react" alt="react" /><img src="https://avatars3.githubusercontent.com/u/984368?v=3&s=100" height="50" title="rxjs" alt="rxjs" /><img src="https://camo.githubusercontent.com/a6ee039214392d86e038c5d601f55ec60310d03c/68747470733a2f2f63646e2e7261776769742e636f6d2f7072706c782f7376672d6c6f676f732f6d61737465722f7376672f6d6174657269616c697a652e737667" height="47" title="materializecss" alt="materializecss" />



## build

#### development

To run the app in development, first you need to create a file in the app root directory called devCredentials.json. This is to supply the app with aws credentials. The file won't be source controlled.
It's a single object with 2 properties:

```
{
    "DEVELOPMENT_AWS_ACCESS_KEY": "...",
    "DEVELOPMENT_AWS_SECRET_KEY": "..."
}
```

Once you have created the credentials file, starting the app is simple:

`$ npm start`

It supports hot reloading of css and triggers a recompile and page reload whenever a javascript file is modified.


#### production

`$ npm run build`

Will compile a production ready build of the client side application.

`$ node server/server.js`

Will run the server.

When running a production build, we stop looking for local developer credentials and instead request temporary credentials from the server (/authenticate). The server sends a request to AWS STS (Security Token Service) to retrieve temporary identity.
In order for the server to do this you need to set **2 environment variables:**

1. AWS_ACCESS_KEY_ID
2. AWS_SECRET_ACCESS_KEY


#### docker

```
$ docker build -t ecs-monitor {checkout_dir}
$ docker run -p 1337:1337 --rm \
    -e AWS_ACCESS_KEY_ID=... \
    -e AWS_SECRET_ACCESS_KEY=... \
    ecs-monitor
```

----

<img src="https://uk-aws-cloud-resources.tombola.com/v201702271355/images/Logos/tombola_logo_teal_on_transparent.png" title="tombola" alt="tombola" height="30" />

_by tombola, enjoy_

_This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app)._

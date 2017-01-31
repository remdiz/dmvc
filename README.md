# dmvc
```
npm install dmvc
```
Use dmvc_client.js on client-side.

  This is a library for a single-page Web application development.
  Wish List:
  * transfer the entire application logic on the server work. This approach should reduce browser hardware requirements.
Server load will increase of course
  * combine in some single system all the components of the MVC-pattern. They should be rigidly connected between the server and the client. This may allow to reduce the complexity of the overall system

  View entities engaged only in the display of information, processing of events and commands,
received from the server.They can be rigidly connected to the controller, located on the back-end 
that processes their signals.
	The controller, upon receipt of a request from the view, processes it, connecting the Model if needed.
After processing, if required by the application logic, the client receives a set of instructions 
for modifying the view.

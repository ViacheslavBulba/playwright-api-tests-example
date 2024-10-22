CRUD operations

CRUD is an acronym for the four basic operations used to manipulate data:

- Create: Adds new records to the database
- Read: Retrieves data from the database
- Update: Modifies existing records in the database
- Delete: Removes existing records from the database

In a REST environment, CRUD operations correspond to the following HTTP methods:

- POST: Creates a new resource
- GET: Reads a resource
- PUT: Updates a resource
- DELETE: Removes a resource

# Install dependencies

`cd PROJECT_FOLDER`

`npm install`

# Run tests

`npx playwright test tests/api-tests-example.spec.js`

or, to run an individual test

`npx playwright test -g "POST - create a booking"`

# Log example

![](test-result-log.png)

# Troubleshooting

If you want to run the tests from IDE directly using "Playwright Test for VSCode" plugin but you do not see your tests under testing tab and you do not see green play/run icon - most likely you opened VS Code from terminal - close it and open it from Applications Launchpad - path environments variables are different in these two cases and that is the reason you don't see it.

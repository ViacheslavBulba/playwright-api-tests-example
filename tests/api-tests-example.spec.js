// @ts-check
const { test, expect } = require('@playwright/test');
import { faker } from '@faker-js/faker';
const { DateTime } = require("luxon");

// CRUD operations approach can be use to test API

// CRUD is an acronym for the four basic operations used to manipulate data:

// - Create: Adds new data
// - Read: Retrieves data from the source
// - Update: Modifies existing data
// - Delete: Removes existing data

// In a RESTful API environment, CRUD operations correspond to the following HTTP methods:

// - POST: Creates a new resource
// - GET: Reads a resource
// - PUT: Updates a resource
// - DELETE: Removes a resource

const baseURL = 'https://restful-booker.herokuapp.com';

const authTokenEndpoint = `${baseURL}/auth`;
const bookingEndpoint = `${baseURL}/booking`; // can accept POST, GET, DELETE

async function sendPostToGetAuthToken(request) {
  let token = '';
  const response = await request.post(authTokenEndpoint, {
    data: {
      "username": "admin",
      "password": "password123"
    }
  });
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  token = responseBody.token;
  return token;
}

test('POST - get auth token', async ({ request }) => {
  const response = await request.post(authTokenEndpoint, {
    data: {
      "username": "admin",
      "password": "password123"
    }
  });
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  console.log('verify that reponse has "token" field');
  expect(responseBody).toHaveProperty("token");
  console.log('verify that the token length is 15 symbols');
  expect(responseBody.token.length).toBe(15);
});

test('POST - create a booking', async ({ request }) => {
  const randomFirstName = faker.person.firstName();
  const randomLastName = faker.person.lastName();
  const randomTotalPrice = faker.number.int(999);
  const randomBoolean = faker.datatype.boolean();
  const randomNeeds = faker.word.noun();
  const currentDate = DateTime.now().toFormat('yyyy-MM-dd');
  const currentDatePlusFive = DateTime.now().plus({ days: 5 }).toFormat('yyyy-MM-dd');
  const body = {
    "firstname": randomFirstName,
    "lastname": randomLastName,
    "totalprice": randomTotalPrice,
    "depositpaid": randomBoolean,
    "bookingdates": {
      "checkin": currentDate,
      "checkout": currentDatePlusFive
    },
    "additionalneeds": randomNeeds,
  }
  console.log(`request: ${bookingEndpoint}`);
  console.log(body);
  let response = await request.post(bookingEndpoint, {
    data: body
  });
  console.log('response:');
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  let responseBody = await response.json();
  expect(responseBody.bookingid).toBeGreaterThan(0);
  expect(responseBody).toHaveProperty("booking");
  expect(responseBody.booking).toHaveProperty("firstname", randomFirstName);
  expect(responseBody.booking).toHaveProperty("lastname", randomLastName);
  expect(responseBody.booking).toHaveProperty("totalprice", randomTotalPrice);
  expect(responseBody.booking).toHaveProperty("depositpaid", randomBoolean);
  expect(responseBody.booking.bookingdates).toHaveProperty("checkin", currentDate);
  expect(responseBody.booking.bookingdates).toHaveProperty("checkout", currentDatePlusFive);
  expect(responseBody.booking).toHaveProperty("additionalneeds", randomNeeds);
  const bookingId = responseBody.bookingid;
  console.log(`bookingId: ${bookingId}`);
  console.log('GET all bookings ids after POST - verify that new id is present in get all bookings');
  response = await request.get(bookingEndpoint);
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(JSON.stringify(await response.json())).toContain(`{\"bookingid\":${bookingId}}`);
  console.log(`GET specific booking by id ${bookingId} after POST`);
  response = await request.get(`${bookingEndpoint}/${bookingId}`);
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  responseBody = await response.json();
  expect(responseBody).toHaveProperty("firstname", randomFirstName);
  expect(responseBody).toHaveProperty("lastname", randomLastName);
  expect(responseBody).toHaveProperty("totalprice", randomTotalPrice);
  expect(responseBody).toHaveProperty("depositpaid", randomBoolean);
  expect(responseBody.bookingdates).toHaveProperty("checkin", currentDate);
  expect(responseBody.bookingdates).toHaveProperty("checkout", currentDatePlusFive);
  expect(responseBody).toHaveProperty("additionalneeds", randomNeeds);
});

test('GET - all bookings ID list', async ({ request }) => {
  const response = await request.get(bookingEndpoint);
  let responseBody = await response.json();
  console.log(responseBody);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(`verify that an array is returned and the first object has property "bookingid"`)
  expect(responseBody[0]).toHaveProperty("bookingid");
  expect(responseBody[0].bookingid).toBeGreaterThan(0);
});

test('GET - with parameters', async ({ request }) => {
  const response = await request.get(bookingEndpoint, {
    params: {
      firstname: "Susan",
      lastname: "Jackson"
    },
  });
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});

test('PUT - with headers and auth token in cookie', async ({ request }) => {
  const token = await sendPostToGetAuthToken(request);
  // PUT
  const updateRequest = await request.put(`${bookingEndpoint}/2`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}`
    },
    data: {
      "firstname": "Jim",
      "lastname": "Brown",
      "totalprice": 111,
      "depositpaid": true,
      "bookingdates": {
        "checkin": "2023-06-01",
        "checkout": "2023-06-15"
      },
      "additionalneeds": "Breakfast"
    }
  });
  console.log(await updateRequest.json());
  expect(updateRequest.ok()).toBeTruthy();
  expect(updateRequest.status()).toBe(200);
  const updatedResponseBody = await updateRequest.json()
  expect(updatedResponseBody).toHaveProperty("firstname", "Jim");
  expect(updatedResponseBody).toHaveProperty("lastname", "Brown");
  expect(updatedResponseBody).toHaveProperty("totalprice", 111);
  expect(updatedResponseBody).toHaveProperty("depositpaid", true);
});

test('PATCH - Updating a resource partially', async ({ request }) => {
  const token = await sendPostToGetAuthToken(request);
  // PATCH
  const partialUpdateRequest = await request.patch(`${bookingEndpoint}/2`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}`
    },
    data: {
      "firstname": "Sim",
      "lastname": "Son",
      "totalprice": 333,
      "depositpaid": false
    }
  });
  console.log(await partialUpdateRequest.json());
  expect(partialUpdateRequest.ok()).toBeTruthy();
  expect(partialUpdateRequest.status()).toBe(200);
  const partialUpdatedResponseBody = await partialUpdateRequest.json()
  expect(partialUpdatedResponseBody).toHaveProperty("firstname", "Sim");
  expect(partialUpdatedResponseBody).toHaveProperty("lastname", "Son");
  expect(partialUpdatedResponseBody).toHaveProperty("totalprice", 333);
  expect(partialUpdatedResponseBody).toHaveProperty("depositpaid", false);
});

test('DELETE', async ({ request }) => {
  const token = await sendPostToGetAuthToken(request);
  console.log('get first available id for deletion');
  const getBookingsResponse = await request.get(bookingEndpoint);
  console.log(await getBookingsResponse.json());
  let bookingsResponseBody = await getBookingsResponse.json();
  const bookingId = bookingsResponseBody[0].bookingid;
  console.log("bookingId for deletion: " + bookingId);
  console.log('send DELETE request and verify response code = 201');
  const deleteRequest = await request.delete(`${bookingEndpoint}/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`
    }
  });
  console.log(await deleteRequest.text());
  expect(deleteRequest.status()).toEqual(201);
});



// // GITHUB API EXAMPLE BELOW - ADD githubAuthToken FIRST

// const REPO = 'playwright-api-tests-example';
// const USER = 'ViacheslavBulba';

// test('POST with headers - github - create issue in repo and get it by id number', async ({ request }) => {
//   const baseURL = 'https://api.github.com';
//   const githubAuthToken = '';
//   if (githubAuthToken === '') {
//     console.log('PUT IN YOUR GITHUB ACCESS TOKEN');
//     test.skip();
//   }
//   const dateAndTime = new Date().toLocaleString();
//   const issueTitle = '[Bug] report - ' + dateAndTime;
//   const issueDescription = 'Bug description';
//   const headers = {
//     "Authorization": `token ${githubAuthToken}`,
//     "Accept": "application/vnd.github.v3+json",
//   }
//   const body = {
//     data: {
//       title: issueTitle,
//       body: issueDescription,
//     },
//     headers
//   };
//   console.log(`send post request to create new issue`);
//   const postRequestCreateIssue = await request.post(`${baseURL}/repos/${USER}/${REPO}/issues`, body);
//   console.log(await postRequestCreateIssue.json());
//   console.log(`verify response code = ok`);
//   expect(postRequestCreateIssue.ok()).toBeTruthy();
//   console.log(`send get request to receive all issues`);
//   const getRequestGetAllIssues = await request.get(`${baseURL}/repos/${USER}/${REPO}/issues`);
//   console.log(`verify response code = ok`);
//   expect(getRequestGetAllIssues.ok()).toBeTruthy();
//   console.log(`verify that newly created issue is present in all issues response`);
//   expect(await getRequestGetAllIssues.json()).toContainEqual(expect.objectContaining(body.data));
//   const response = await postRequestCreateIssue.json();
//   const issueNumber = response.number;
//   console.log(`send get request to receive issue number ${issueNumber}`);
//   const getRequestGetIssueByNumber = await request.get(`${baseURL}/repos/${USER}/${REPO}/issues/${issueNumber}`);
//   console.log(await getRequestGetIssueByNumber.json());
//   console.log(`verify response code = ok`);
//   expect(getRequestGetIssueByNumber.ok()).toBeTruthy();
//   const responseGetIssueByNumber = await getRequestGetIssueByNumber.json();
//   console.log(`verify that 'number' field in response = ${issueNumber}`);
//   expect(responseGetIssueByNumber.number).toBe(issueNumber);
//   console.log(`verify that 'title' field in response = ${issueTitle}`);
//   expect(responseGetIssueByNumber.title).toBe(issueTitle);
//   console.log(`verify that 'body' field in response = ${issueDescription}`);
//   expect(responseGetIssueByNumber.body).toBe(issueDescription);
//   console.log('see created issues on Web UI here - https://github.com/ViacheslavBulba/playwright-api-tests-example/issues');
// });

// https://github.com/ViacheslavBulba/playwright-api-tests-example/issues

// test.beforeAll(async ({ request }) => {
//   // Create a new repository
//   const response = await request.post('/user/repos', {
//     data: {
//       name: REPO
//     }
//   });
//   expect(response.ok()).toBeTruthy();
// });

// test.afterAll(async ({ request }) => {
//   // Delete all existing issues as cleanup - NO DELETE API ON GITHUB FOR ISSUES
//   const issuesResponse = await request.get(`/repos/${USER}/${REPO}/issues`);
//   expect(issuesResponse.ok()).toBeTruthy();
//   const issues = await issuesResponse.json();
//   console.log(issues);
//   for (const issue of issues) {
//     const response = await request.delete(`/repos/${USER}/${REPO}/issues/${issue.number}`);
//     console.log(await response.json());
//     expect(response.ok()).toBeTruthy();
//   }

//   // // Delete the repository
//   // const response = await request.delete(`/repos/${USER}/${REPO}`);
//   // expect(response.ok()).toBeTruthy();
// });

/**
 * @param {number | undefined} ms
 */
async function delay(ms) {
  if (ms !== undefined) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
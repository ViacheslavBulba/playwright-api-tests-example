// @ts-check
const { test, expect } = require('@playwright/test');
import { faker } from '@faker-js/faker';
const { DateTime } = require("luxon");

test('POST - create a booking', async ({ request }) => {
  const baseURL = 'https://restful-booker.herokuapp.com';
  const randomFirstName = faker.person.firstName();
  const randomLastName = faker.person.lastName();
  const randomTotalPrice = faker.number.int(999);
  const randomBoolean = faker.datatype.boolean();
  const randomNeeds = faker.word.noun();
  const currentDate = DateTime.now().toFormat('yyyy-MM-dd');
  const currentDatePlusFive = DateTime.now().plus({ days: 5 }).toFormat('yyyy-MM-dd');
  let response = await request.post(`${baseURL}/booking`, {
    data: {
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
  });
  console.log('--- response ---');
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
  // GET all bookings ids after POST
  response = await request.get(`${baseURL}/booking`);
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(JSON.stringify(await response.json())).toContain(`{\"bookingid\":${bookingId}}`);
  // GET specific booking by id after POST
  response = await request.get(`${baseURL}/booking/${bookingId}`);
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

test('GET - get booking id list', async ({ request }) => {
  const baseURL = 'https://restful-booker.herokuapp.com';
  const response = await request.get(`${baseURL}/booking`);
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});

test('GET with parameters', async ({ request }) => {
  const baseURL = 'https://restful-booker.herokuapp.com';
  const response = await request.get(`${baseURL}/booking`, {
    params: {
      firstname: "Susan",
      lastname: "Jackson"
    },
  });
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});

test('PUT with headers and auth token in cookie', async ({ request }) => {
  const baseURL = 'https://restful-booker.herokuapp.com';
  let token = '';
  // get auth token which will be used in PUT request
  const response = await request.post(`${baseURL}/auth`, {
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
  console.log("token: " + token);
  // PUT
  const updateRequest = await request.put(`${baseURL}/booking/2`, {
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
  const baseURL = 'https://restful-booker.herokuapp.com';
  let token = '';
  // get auth token which will be used in PATCH request
  const response = await request.post(`${baseURL}/auth`, {
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
  console.log("token: " + token);
  // PATCH
  const partialUpdateRequest = await request.patch(`${baseURL}/booking/2`, {
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
  const baseURL = 'https://restful-booker.herokuapp.com';
  let token = '';
  // get auth token which will be used in DELETE request
  const response = await request.post(`${baseURL}/auth`, {
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
  console.log("token: " + token);
  // DELETE
  const deleteRequest = await request.delete(`${baseURL}/booking/1`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`
    }
  });
  expect(deleteRequest.status()).toEqual(201);
  expect(deleteRequest.statusText()).toBe('Created');
});

// GITHUB API EXAMPLE BELOW - ADD githubAuthToken FIRST

const REPO = 'playwright-api-tests-example';
const USER = 'ViacheslavBulba';

test('POST with headers - github - create issue in repo and get it by id number', async ({ request }) => {
  const baseURL = 'https://api.github.com';
  const githubAuthToken = '';
  if (githubAuthToken === '') {
    console.log('PUT IN YOUR GITHUB ACCESS TOKEN');
    return;
  }
  const dateAndTime = new Date().toLocaleString();
  const issueTitle = '[Bug] report - ' + dateAndTime;
  const issueDescription = 'Bug description';
  const headers = {
    "Authorization": `token ${githubAuthToken}`,
    "Accept": "application/vnd.github.v3+json",
  }
  const body = {
    data: {
      title: issueTitle,
      body: issueDescription,
    },
    headers
  };
  console.log(`send post request to create new issue`);
  const postRequestCreateIssue = await request.post(`${baseURL}/repos/${USER}/${REPO}/issues`, body);
  console.log(await postRequestCreateIssue.json());
  console.log(`verify response code = ok`);
  expect(postRequestCreateIssue.ok()).toBeTruthy();
  console.log(`send get request to receive all issues`);
  const getRequestGetAllIssues = await request.get(`${baseURL}/repos/${USER}/${REPO}/issues`);
  console.log(`verify response code = ok`);
  expect(getRequestGetAllIssues.ok()).toBeTruthy();
  console.log(`verify that newly created issue is present in all issues response`);
  expect(await getRequestGetAllIssues.json()).toContainEqual(expect.objectContaining(body.data));
  const response = await postRequestCreateIssue.json();
  const issueNumber = response.number;
  console.log(`send get request to receive issue number ${issueNumber}`);
  const getRequestGetIssueByNumber = await request.get(`${baseURL}/repos/${USER}/${REPO}/issues/${issueNumber}`);
  console.log(await getRequestGetIssueByNumber.json());
  console.log(`verify response code = ok`);
  expect(getRequestGetIssueByNumber.ok()).toBeTruthy();
  const responseGetIssueByNumber = await getRequestGetIssueByNumber.json();
  console.log(`verify that 'number' field in response = ${issueNumber}`);
  expect(responseGetIssueByNumber.number).toBe(issueNumber);
  console.log(`verify that 'title' field in response = ${issueTitle}`);
  expect(responseGetIssueByNumber.title).toBe(issueTitle);
  console.log(`verify that 'body' field in response = ${issueDescription}`);
  expect(responseGetIssueByNumber.body).toBe(issueDescription);
  console.log('see created issues on Web UI here - https://github.com/ViacheslavBulba/playwright-api-tests-example/issues');
});

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
// @ts-check
const { test, expect } = require('@playwright/test');
import { faker } from '@faker-js/faker';
const { DateTime } = require("luxon");

// CRUD operations approach can be use to test API

// CRUD is an acronym for the four basic operations used to manipulate data:

// - Create: POST request
// - Read: GET request
// - Update: PUT / PATCH request
// - Delete: DELETE request

const baseURL = 'https://restful-booker.herokuapp.com';

const authTokenEndpoint = `${baseURL}/auth`;
const bookingEndpoint = `${baseURL}/booking`; // can accept POST, GET, DELETE

let authToken = null;
let bookingId = null;

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
  expect(token.length).toBe(15);
  return token;
}

test.beforeAll(async ({ request }) => {
  authToken = await sendPostToGetAuthToken(request);
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
  bookingId = responseBody.bookingid;
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

test('GET - with parameters', async ({ request }) => {
  console.log(`GET specific booking by id ${bookingId} after POST`);
  const response = await request.get(`${bookingEndpoint}/${bookingId}`);
  console.log(await response.json());
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
});

test('PUT - update booking', async ({ request }) => {
  const updateRequest = await request.put(`${bookingEndpoint}/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${authToken}`
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
  const partialUpdateRequest = await request.patch(`${bookingEndpoint}/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${authToken}`
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
  console.log("bookingId for deletion: " + bookingId);
  console.log('send DELETE request and verify response code = 201');
  const deleteRequest = await request.delete(`${bookingEndpoint}/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${authToken}`
    }
  });
  console.log(await deleteRequest.text());
  expect(deleteRequest.status()).toEqual(201);
  const getRequest = await request.get(`${bookingEndpoint}/${bookingId}`);
  expect(getRequest.status()).toEqual(404);
  expect(getRequest.statusText()).toEqual('Not Found');
});
// @ts-check
const { test, expect } = require('@playwright/test');

const REPO = 'playwright-api-tests-example';
const USER = 'ViacheslavBulba';

const dateAndTime = new Date().toLocaleString();

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
//   // Delete the repository
//   const response = await request.delete(`/repos/${USER}/${REPO}`);
//   expect(response.ok()).toBeTruthy();
// });

test('should create a bug report', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Bug] report - ' + dateAndTime,
      body: 'Bug description',
    }
  });
  console.log(await newIssue.json());
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Bug] report - ' + dateAndTime,
    body: 'Bug description'
  }));
});

test('should create a feature request', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Feature] request - ' + dateAndTime,
      body: 'Feature description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Feature] request - ' + dateAndTime,
    body: 'Feature description'
  }));
});
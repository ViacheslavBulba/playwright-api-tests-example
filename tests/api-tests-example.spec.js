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

test('create issue in repo and get it by id number', async ({ request }) => {

  const issueTitle = '[Bug] report - ' + dateAndTime;
  const issueDescription = 'Bug description';

  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: issueTitle,
      body: issueDescription,
    }
  });
  console.log(await newIssue.json());
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: issueTitle,
    body: issueDescription
  }));

  const response = await newIssue.json();
  const issueNumber = response.number;
  const getIssueByNumber = await request.get(`/repos/${USER}/${REPO}/issues/${issueNumber}`);
  console.log(await getIssueByNumber.json());
  expect(getIssueByNumber.ok()).toBeTruthy();
  const responseGetIssueByNumber = await getIssueByNumber.json();
  console.log(`verify that 'number' field in response = ${issueNumber}`);
  expect(responseGetIssueByNumber.number).toBe(issueNumber);
  console.log(`verify that 'title' field in response = ${issueTitle}`);
  expect(responseGetIssueByNumber.title).toBe(issueTitle);
  console.log(`verify that 'body' field in response = ${issueDescription}`);
  expect(responseGetIssueByNumber.body).toBe(issueDescription);
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
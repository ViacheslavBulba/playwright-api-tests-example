// @ts-check
const { test, expect } = require('@playwright/test');

const REPO = 'playwright-api-tests-example';
const USER = 'ViacheslavBulba';

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

test('create issue in repo and get it by id number', async ({ request }) => {
  const dateAndTime = new Date().toLocaleString();
  const issueTitle = '[Bug] report - ' + dateAndTime;
  const issueDescription = 'Bug description';

  const body = {
    data: {
      title: issueTitle,
      body: issueDescription,
    }
  }

  console.log(`send post request to create new issue`);
  const postRequestCreateIssue = await request.post(`/repos/${USER}/${REPO}/issues`, body);
  // console.log(await postRequestCreateIssue.json());
  console.log(`verify response code = ok`);
  expect(postRequestCreateIssue.ok()).toBeTruthy();

  console.log(`send get request to receive all issues`);
  const getRequestGetAllIssues = await request.get(`/repos/${USER}/${REPO}/issues`);
  console.log(`verify response code = ok`);
  expect(getRequestGetAllIssues.ok()).toBeTruthy();
  console.log(`verify that newly created issue is present in all issues response`);
  expect(await getRequestGetAllIssues.json()).toContainEqual(expect.objectContaining(body.data));

  const response = await postRequestCreateIssue.json();
  const issueNumber = response.number;
  console.log(`send get request to receive issue number ${issueNumber}`);
  const getRequestGetIssueByNumber = await request.get(`/repos/${USER}/${REPO}/issues/${issueNumber}`);
  // console.log(await getRequestGetIssueByNumber.json());
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
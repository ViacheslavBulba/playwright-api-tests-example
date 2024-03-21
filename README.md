![](test-result-log.png)


cd PROJECT_FOLDER


npm install


npx playwright test tests/api-tests-example.spec.js


npx playwright test -g "POST - create a booking"


If you want to run the tests from IDE directly using "Playwright Test for VSCode" plugin but you do not see your tests under testing tab and you do not see green play/run icon - most likely you opened VS Code from terminal - close it and open it from Applications Launchpad - path environments variables are different in these two cases and that is the reason you don't see it.
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');

async function getUserInfo() {
  const questions = [
    {
      type: 'input',
      name: 'email',
      message: "What's your email?",
    },
    {
      type: 'password',
      name: 'password',
      message: "What's your password?",
    },
  ];

  let answer = {
    email: '',
    password: '',
  };

  await inquirer.prompt(questions).then(async answers => {
    const regex = new RegExp(
      "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    );
    const isEmail = await regex.exec(answers.email);
    if (!answers.email || !answers.password) {
      await console.log('Email or password cannot be blank');
      await getUserInfo();
    } else if (!isEmail) {
      await console.log("Email isn't email.");
      await getUserInfo();
    } else {
      answer = {
        email: answers.email,
        password: answers.password,
      };
    }
  });

  return answer;
}

async function login(page) {
  await page.waitFor('.login-form'); // wait for login form.
  const userInfo = await getUserInfo(); // ask email and password to user.
  await page.type('#login-email', userInfo.email); // type email to input.
  await page.type('#login-password', userInfo.password); // type password to input.
  await Promise.all([
    page.click('#login-submit'), // click to login button.
    page.waitForNavigation(), // wait for login.
  ]);

  try {
    await page.waitForSelector('.login__form', { timeout: 1000 });
    console.log('Email or password is wrong. Please try again.');
    await page.goto('https://www.linkedin.com'); // go to linkedin.
    await login(page);
  } catch (error) {
    return true;
  }
}

async function finishHim(page) {
  const deleteButton =
    '[data-control-name="A_jobshome_job_delete_application_click"]';
  await page.waitFor(1000);
  const isDeleteExist = await page.waitForSelector(deleteButton);
  if (isDeleteExist) {
    await page.click(deleteButton);
  } else {
    console.log('I think its done.');
  }
  await page.waitFor(1000);
  const isFinishExist = await page.waitForSelector('.artdeco-button--primary');
  if (isFinishExist) {
    await page.click('.artdeco-button--primary');
    const time = new Date().toLocaleString();
    await console.log(time + ': 1 deleted.');
  } else {
    console.log('Something wrong.')
    deleteList(page);
  }
}

async function deleteList(page) {
  await page.waitForSelector('.jobs-activity__list-item');
  const buttons = await page.$$('.jobs-activity__list-item');
  await console.log('I found something, starting!');
  for (let button of buttons) {
    await finishHim(page);
  }
  await page.reload();
  await console.log('Page reloaded, just a moment.');
  await deleteList(page);
}

async function deleteJob() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 10,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto('https://www.linkedin.com'); // go to linkedin.
  const loginSuccess = await login(page);

  if (loginSuccess) {
    await console.log('Redirecting to applied page.')
    await page.goto('https://www.linkedin.com/jobs/applied/'); // go to linkedin applied page and wait for load.
    await deleteList(page);
  } else {
    await console.log('Something wrong with login. Closing.');
    await browser.close;
  }

  await browser.close;
}

deleteJob();

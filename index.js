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

  const wrongLogin = await page.waitForSelector('.login__form');

  if (wrongLogin) {
    console.log('Email or password is wrong. Please try again.')
    await page.goto('https://www.linkedin.com'); // go to linkedin.
    await login(page);
  }
}

async function deleteJob() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.linkedin.com'); // go to linkedin.
  await login(page);

  await browser.close;
}

deleteJob();

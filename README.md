## **uask Playwright Automation**

This project focuses on designing and implementing an end-to-end QA automation framework for a government-grade, GPT-powered chatbot. The objective was to validate not only the chatbot’s user interface, but also the reliability, safety, and correctness of AI-generated responses across multiple languages.

The automation was built with a strong emphasis on real user behavior, AI failure scenarios, and security risks commonly associated with generative AI systems.

Tests support multiple environments and can be executed locally or through GitHub Actions.

## **📦 Installation**

Clone the repository and install dependencies:

`npm i`

Playwright browsers:

`npx playwright install`

## **🚀 Running Tests Locally**

The project requires an ENV variable to pick the correct config (qa, dev, stg).

### **Run the full suite**

`ENV=qa npx playwright test`

### **Run with specific options**

Run with one worker on _both_ devices, trace enabled:

`ENV=qa npx playwright test --workers=1 --repeat-each=1 --trace on`

### **Run a with specific device --project**

`ENV=qa npx playwright test --grep "TC-A02" --workers=1 --repeat-each=1 --trace on --project="chromium"`

`ENV=qa npx playwright test --grep "TC-A02" --workers=1 --repeat-each=1 --trace on --project="mobile"`

### **Run a specific test/group using --grep:**

`ENV=qa npx playwright test --grep "TC-A02" --workers=1 --repeat-each=1 --trace on`

### **View HTML Report**

`npx playwright show-report`

## **🧪 GitHub Actions Workflows**

This project uses GitHub Actions to automate quality checks and test execution:

1. PR Validation Workflow

Runs on every Pull Request and ensures:
• TypeScript compiles successfully
• Playwright tests can load
• No missing imports or syntax errors

2. Playwright Test Workflow

Manually triggered using Run Workflow in GitHub.
It:
• Installs dependencies
• Installs Playwright browsers
• Executes the full test suite
• Uploads the HTML report as an artifact

🧷 Notes
• GitHub Actions runs headless by default.
• Reports are available as workflow artifacts.
• You can change environments by editing ENV: in the workflow file.

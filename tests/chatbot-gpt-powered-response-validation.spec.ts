import { test, expect } from '@playwright/test';
import { UAskPage } from '../page-objects/uask.page.ts';
import { ChatWidget } from '../page-objects/chat-widget.component.ts';
import testData from '../common/files/data/prompt.json';

test('TC-B01: AI provides a clear and helpful response to common public service queries', async ({ page }) => {
    const uaskPage = new UAskPage(page);
    const chat = new ChatWidget(page);

    //Navigate to uask
    await uaskPage.goto();
    await uaskPage.isChatVisible();

    //set language to English
    await uaskPage.setLanguage('en');

    //fill and send message
    await chat.fillAndSend(testData.englishVisaQuery.prompt);
    await chat.waitForResponse();

    const response = (await chat.lastMessageResponse()) as string;
    expect(response.length).toBeGreaterThan(30);

    for (const keyword of testData.englishVisaQuery.expectedKeywords) {
        expect(response.toLowerCase()).toContain(keyword.toLowerCase());
    }
    expect(response.trim().endsWith('.')).toBeTruthy();
});

test('TC-B02: No hallucinated response', async ({ page }) => {
    const uaskPage = new UAskPage(page);
    const chat = new ChatWidget(page);

    //Navigate to uask
    await uaskPage.goto();
    await uaskPage.isChatVisible();

    //set language to English
    await uaskPage.setLanguage('en');

    //fill and send message
    await chat.fillAndSend(testData.hallucinationQuery);
    await chat.waitForResponse();

    const response = (await chat.lastMessageResponse()) as string;
    console.log('AI Response:\n', response);

    expect(response.toLowerCase()).toMatch(
        /(don’t have enough information|not available|cannot help|cannot find the most relevant answer)/i
    );
});

test('TC-B03: English and Arabic intent consistency', async ({ page }) => {
    const uaskPage = new UAskPage(page);
    const chat = new ChatWidget(page);

    //Navigate to uask
    await uaskPage.goto();
    await uaskPage.isChatVisible();

    //set language to English
    await uaskPage.setLanguage('en');

    //fill and send message in English
    await chat.fillAndSend(testData.englishVisaQuery.prompt);
    await chat.waitForResponse();

    const enResponse = (await chat.lastMessageResponse()) as string;

    // Switch to Arabic
    await uaskPage.setLanguage('ar');

    //fill and send message in Arabic
    await chat.fillAndSend(testData.arabicVisaQuery.prompt);
    await chat.waitForResponse();

    const arResponse = (await chat.lastMessageResponse()) as string;

    expect(enResponse.toLowerCase()).toContain('visa');
    expect(arResponse).toContain('تأشيرة');
});

test('TC-B04: Response formatting and rendering', async ({ page }) => {
    const uaskPage = new UAskPage(page);
    const chat = new ChatWidget(page);

    //Navigate to uask
    await uaskPage.goto();
    await uaskPage.isChatVisible();

    //set language to English
    await uaskPage.setLanguage('en');

    //fill and send message in English
    await chat.fillAndSend(testData.englishVisaQuery.prompt);
    await chat.waitForResponse();

    const response = (await chat.lastMessageResponse()) as string;

    expect(response).not.toContain('<script>');
    expect(response).not.toContain('```');
    expect(response).not.toContain('###');
});

test.skip('TC-B05: Loading and fallback message', async ({ page, context }) => {
    // Intercept and mock the API response to simulate a failure
    await context.route('**/api/Ingenium/ask**', (route) => {
        route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' }),
        });
    });

    const uaskPage = new UAskPage(page);
    const chat = new ChatWidget(page);

    //Navigate to uask
    await uaskPage.goto();
    await uaskPage.isChatVisible();

    //set language to English
    await uaskPage.setLanguage('en');

    //fill and send message in English
    await chat.fillAndSend(testData.englishVisaQuery.prompt);

    await page.pause();

    const response = (await chat.lastMessageResponse()) as string;
    console.log('AI Response:\n', response);
});

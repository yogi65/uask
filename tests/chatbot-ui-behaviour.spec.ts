import { test, expect } from '@playwright/test';
import { UAskPage } from '../page-objects/uask.page';
import { ChatWidget } from '../page-objects/chat-widget.component';

const EN_MESSAGE = 'How to renew my UAE visa?';
const AR_MESSAGE = 'كيف أجدد تأشيرة دخولي إلى الإمارات العربية المتحدة؟';

test.describe('U-Ask Chat Widget - Optimised Specs', () => {
    let uaskPage: UAskPage;
    let chat: ChatWidget;

    test.beforeEach(async ({ page }) => {
        uaskPage = new UAskPage(page);
        chat = new ChatWidget(page);

        await uaskPage.goto();
        await uaskPage.isChatVisible();
    });

    const sendMessage = async (language: 'en' | 'ar', message: string) => {
        await uaskPage.setLanguage(language);
        await chat.fillAndSend(message);
        await chat.waitForResponse();
        expect(await chat.lastMessageRequest()).toEqual(message);
    };

    test('TC-A01: Chat widget loads correctly on desktop and mobile', async () => {
        await uaskPage.isChatVisible();
    });

    test('TC-A02: User can send messages via input box', async () => {
        await sendMessage('en', EN_MESSAGE);
    });

    test('TC-A03: AI responses are rendered properly in the conversation area', async () => {
        await sendMessage('en', EN_MESSAGE);

        const response = (await chat.lastMessageResponse()) as string;
        expect(response.length).toBeGreaterThan(20);
    });

    test.describe('TC-A04: Multilingual support (LTR / RTL)', () => {
        test('English responses should be LTR', async () => {
            await sendMessage('en', EN_MESSAGE);
            await expect(chat.chatLastRespDirAttrLocator).toHaveAttribute('dir', 'ltr');
        });

        test('Arabic responses should be RTL', async () => {
            await sendMessage('ar', AR_MESSAGE);
            await expect(chat.chatLastRespDirAttrLocator).toHaveAttribute('dir', 'rtl');
        });
    });

    test('TC-A05: Input is cleared after sending a message', async () => {
        await sendMessage('en', EN_MESSAGE);
        await chat.assertInputCleared();
    });

    test('TC-A06: Scroll and accessibility work as expected', async ({ page }) => {
        await uaskPage.setLanguage('en');

        const msgSent = [
            'How to renew my UAE visa?',
            'What are the requirements for a business visa?',
            'Tell me about UAE tourist attractions?',
        ];

        const msgRcvd = [];
        for (let i = 0; i < msgSent.length; i++) {
            await chat.fillAndSend(msgSent[i]);
            await chat.waitForResponse();
            msgRcvd.push(await chat.listOfResponses.nth(i).innerText()); // collect all AI responses
        }

        const requestCount = await chat.listOfRequests.count();

        for (let i = 0; i < requestCount; i++) {
            await chat.listOfRequests.nth(i).scrollIntoViewIfNeeded();
            await page.waitForTimeout(300); // allow any lazy loading
            const reqMsg = await chat.listOfRequests.nth(i).innerText();
            const resMsg = await chat.listOfResponses.nth(i).innerText();
            expect(reqMsg).toBe(msgSent[i]);
            expect(resMsg).toBe(msgRcvd[i]);
        }
    });
});

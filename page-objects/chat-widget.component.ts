import { Page, Locator, expect } from '@playwright/test';

export class ChatWidget {
    readonly page: Page;
    readonly inputTextareaLocator: Locator;
    readonly sendBtnLocator: Locator;
    readonly chatLoaderLocator: Locator;
    readonly chatLastResponse: Locator;
    readonly chatLastRequest: Locator;
    readonly chatLastRespDirAttrLocator: Locator;
    readonly listOfResponses: Locator;
    readonly listOfRequests: Locator;
    readonly stopAnsweringBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputTextareaLocator = this.page.locator('#conversation');
        this.sendBtnLocator = this.page.locator('#arrow-up-circle');
        this.chatLoaderLocator = this.page.locator('.loader-chat');
        this.chatLastResponse = this.page.locator('//markdown').last();
        this.chatLastRespDirAttrLocator = this.page.locator('//markdown//ancestor::div[3]').last();
        this.chatLastRequest = this.page
            .locator(`//markdown//ancestor::div//preceding-sibling::div//p[contains(@class,'title-user')]`)
            .last();
        this.listOfResponses = this.page.locator('//markdown');
        this.listOfRequests = this.page.locator(
            `//markdown//ancestor::div//preceding-sibling::div//p[contains(@class,'title-user')]`
        );
        this.stopAnsweringBtn = this.page.locator(
            `//button[@aria-label='توقف عن الرد' or @aria-label='Stop Answering']`
        );
    }

    async fillAndSend(text: string) {
        await this.inputTextareaLocator.pressSequentially(text, { delay: 75 });
        await this.sendBtnLocator.click();
    }

    async lastMessageResponse(): Promise<string | null> {
        await this.chatLastResponse.waitFor();
        return await this.chatLastResponse.textContent(); // ensure latest is rendered
    }

    async lastMessageRequest(): Promise<string | null> {
        await this.chatLastRequest.waitFor();
        return await this.chatLastRequest.textContent(); // ensure latest is rendered
    }

    async waitForResponse() {
        await this.waitForBubbleToDisappear();
        await this.page.waitForTimeout(500); // allow response rendering
        await this.waitForStopAnsweringBtnToDisappear();
    }

    async assertInputCleared() {
        const value = await this.inputTextareaLocator.inputValue();
        expect(value.trim()).toBe('');
    }

    private async waitForStopAnsweringBtnToDisappear() {
        // await this.stopAnsweringBtn.waitFor({ state: 'visible' });
        await this.stopAnsweringBtn.waitFor({ state: 'hidden' });
    }

    private async waitForBubbleToDisappear() {
        await this.chatLoaderLocator.waitFor({ state: 'visible' });
        await this.chatLoaderLocator.waitFor({ state: 'hidden', timeout: 30000 });
    }
}

import { expect, Locator, Page } from '@playwright/test';
import { ChatWidget } from './chat-widget.component';
import { config } from '../config/GlobalConfig.ts';

export class UAskPage {
    readonly page: Page;
    readonly chat: ChatWidget;
    readonly pageLoaderLocator: Locator;
    readonly questionContainerLocator: Locator;
    readonly agreeAndContinueButtonLocator: Locator;
    readonly arabicLangToggleLocator: Locator;
    readonly englishLangToggleLocator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.chat = new ChatWidget(page);
        this.pageLoaderLocator = this.page.locator('.targeted-loader-fullhide');
        this.questionContainerLocator = this.page.locator('.question-container');
        this.agreeAndContinueButtonLocator = this.page.getByRole('button', { name: 'Accept and continue' });
        this.arabicLangToggleLocator = this.page.getByLabel('Arabic', { exact: true });
        this.englishLangToggleLocator = this.page.getByLabel('الإنجليزية', { exact: true });
    }

    async goto() {
        await this.page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

        //wait for bubble to disappear
        await this.waitForPageLoad();

        // accept disclaimer if present
        if (await this.agreeAndContinueButtonLocator.count()) {
            await this.agreeAndContinueButtonLocator.click();
        }
    }

    async isChatVisible() {
        expect(await this.questionContainerLocator.isVisible()).toBe(true);
    }

    async waitForPageLoad() {
        // Keep checking until it stays hidden
        for (let i = 0; i < 5; i++) {
            if (await this.pageLoaderLocator.isVisible()) {
                await this.pageLoaderLocator.waitFor({ state: 'hidden', timeout: 5000 });
            }
            // allow UI updates
            await this.page.waitForTimeout(250);
        }

        // final guarantee
        await this.pageLoaderLocator.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async setLanguage(lang: 'en' | 'ar') {
        const currentUrl = this.page.url();

        // detect current language
        const currentLang = currentUrl.includes('/ar/') ? 'ar' : currentUrl.includes('/en/') ? 'en' : null;

        // If current language already matches the requested one, do nothing
        if (currentLang === lang) {
            return;
        }

        // If language cannot be detected (e.g., initial landing page)
        // fallback to click requested language directly.
        if (!currentLang) {
            await this.clickLanguageToggle(lang);
            await this.waitForLanguageUrl(lang);
            await this.waitForPageLoad();
            return;
        }

        // Flip logic:
        // If current URL contains EN and user requests AR → switch to AR
        // If current URL contains AR and user requests EN → switch to EN
        await this.clickLanguageToggle(lang);
        await this.waitForLanguageUrl(lang);

        // wait for page to stabilize
        await this.waitForPageLoad();
    }

    // helper method for setLanguage
    private async clickLanguageToggle(lang: 'en' | 'ar') {
        if (lang === 'ar') {
            await this.arabicLangToggleLocator.click();
        } else {
            await this.englishLangToggleLocator.click();
        }
    }

    // helper method for setLanguage
    private async waitForLanguageUrl(lang: 'en' | 'ar') {
        const regex = lang === 'ar' ? /^https:\/\/ask\.u\.ae\/ar\/uask/ : /^https:\/\/ask\.u\.ae\/en\/uask/;

        await this.page.waitForURL(regex, { timeout: 10000 });
    }
}

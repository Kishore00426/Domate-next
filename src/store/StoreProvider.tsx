'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import i18n from '@/i18n';
import { I18nextProvider } from 'react-i18next';

export function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                {children}
            </I18nextProvider>
        </Provider>
    );
}

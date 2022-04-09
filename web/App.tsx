import parseAPNG, { APNG } from 'apng-js';
import { useEffect, useState } from 'react';

import { Player } from './components';
import { AppStage } from './types';
import { loadBinaryData } from './utils';

const apngUrl = document.querySelector<HTMLMetaElement>('#data')!.dataset['uri']!;
const loadApng = async () => {
    const apngBuffer = await loadBinaryData(apngUrl);
    return parseAPNG(apngBuffer);
};

export default function App() {
    const [appStage, setAppStatus] = useState<AppStage>(AppStage.Loading);
    const [apng, setApng] = useState<APNG>();

    const init = async () => {
        let apng: APNG | Error;

        try {
            apng = await loadApng();
        } catch (error) {
            console.error(error);
            setAppStatus(AppStage.Errored);
            return;
        }

        if (apng instanceof Error) {
            console.error(apng);
            setAppStatus(AppStage.Errored);
            return;
        }

        setApng(apng);
        setAppStatus(AppStage.Ready);
    };

    useEffect(() => {
        init();
    }, []);

    switch (appStage) {
        case AppStage.Loading:
            return <div>加载中</div>;
        case AppStage.Errored:
            return <div>加载失败</div>;
    }
    return <Player apng={apng!} />;
}

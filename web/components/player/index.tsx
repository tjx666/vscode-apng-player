import { APNG } from 'apng-js';
import { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import ApngPlayer from './player';

import './style.less';

interface PlayerProps {
    apng: APNG;
}

function getAdaptivePreviewSize(apngWidth: number, apngHeight: number) {
    const maxWidth = document.documentElement.clientWidth;
    const maxHeight = document.documentElement.clientHeight - 100;

    const maxRatio = maxWidth / maxHeight;
    const apngRatio = apngWidth / apngHeight;
    if (maxRatio > apngRatio) {
        const scale = maxHeight / apngHeight;
        return [scale * apngWidth, maxHeight, scale];
    } else {
        const scale = maxWidth / apngWidth;
        return [maxWidth, scale * apngHeight, scale];
    }
}

function Player({ apng }: PlayerProps) {
    const previewerRef = useRef<HTMLCanvasElement>(null);

    const adaptiveSize = useMemo(
        () => getAdaptivePreviewSize(apng.width, apng.height),
        [apng.width, apng.height],
    );

    const setup = useCallback(async () => {
        const ctx = previewerRef.current!.getContext('2d')!;
        await apng.createImages();
        new ApngPlayer(apng, ctx, {
            autoPlayer: true,
            scale: adaptiveSize[2],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apng, adaptiveSize[3]]);

    useLayoutEffect(() => {
        setup();
    }, [setup]);

    return (
        <div className="player">
            <div className="previewer-container">
                <canvas
                    className="previewer"
                    ref={previewerRef}
                    width={adaptiveSize[0]}
                    height={adaptiveSize[1]}
                />
            </div>
            <div className="control">
                <button>控件区</button>
            </div>
        </div>
    );
}

export default memo(Player);

import { useMount, useUnmount } from '@/hooks';
import { APNG } from 'apng-js';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
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
    const [player, setPlayer] = useState<ApngPlayer | null>(null);
    const [frameNumber, setFrameNumber] = useState(0);

    const adaptiveSize = useMemo(
        () => getAdaptivePreviewSize(apng.width, apng.height),
        [apng.width, apng.height],
    );

    const handleFrameNumberChange = useCallback((frameNumber: number) => {
        setFrameNumber(frameNumber);
    }, []);

    useMount(async () => {
        const ctx = previewerRef.current!.getContext('2d')!;
        await apng.createImages();
        const player = new ApngPlayer(apng, ctx, {
            autoPlayer: true,
            scale: adaptiveSize[2],
        });
        setPlayer(player);
        player.on('frame', handleFrameNumberChange);
    });

    useUnmount(() => {
        player?.off('frame', handleFrameNumberChange);
    });

    return (
        <div className="player">
            <div className="previewer-container">
                <canvas
                    className="previewer"
                    ref={previewerRef}
                    width={apng.width}
                    height={apng.height}
                    style={{
                        transform: `scale(${adaptiveSize[2]})`,
                    }}
                />
            </div>
            <div className="control">
                <button>{frameNumber}</button>
            </div>
        </div>
    );
}

export default memo(Player);

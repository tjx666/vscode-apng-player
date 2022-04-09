import { APNG } from 'apng-js';
import { useCallback, useLayoutEffect, useRef } from 'react';

interface PlayerProps {
    apng: APNG;
}

export default function Player({ apng }: PlayerProps) {
    const previewerRef = useRef<HTMLCanvasElement>(null);

    const setup = useCallback(async () => {
        const ctx = previewerRef.current!.getContext('2d')!;
        apng.getPlayer(ctx, true);
    }, [apng]);

    useLayoutEffect(() => {
        setup();
    }, [setup]);

    return (
        <div className="player">
            <canvas
                className="previewer"
                ref={previewerRef}
                width={apng.width}
                height={apng.height}
            />
            <div className="control">
                <button>player</button>
            </div>
        </div>
    );
}

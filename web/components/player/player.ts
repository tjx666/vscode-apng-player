import { APNG, Frame } from 'apng-js';
import EventEmitter from 'emittery';

interface ApngPlayerOptions {
    autoPlayer?: boolean;
    scale?: number;
}

export default class ApngPlayer extends EventEmitter {
    public context: CanvasRenderingContext2D;
    public playbackRate = 1.0;

    private _apng: APNG;
    private _scale: number;
    private _prevFrame: Frame | null = null;
    private _prevFrameData: ImageData | null = null;
    private _currentFrameNumber = 0;

    private _ended = false;
    private _paused = true;
    private _numPlays = 0;

    constructor(apng: APNG, context: CanvasRenderingContext2D, options: ApngPlayerOptions) {
        super();
        this._apng = apng;
        this.context = context;
        this._scale = options.scale ?? 1;
        context.scale(this._scale, this._scale);
        this.stop();
        if (options.autoPlayer ?? false) {
            this.play();
        }
    }

    get currentFrameNumber() {
        return this._currentFrameNumber;
    }

    /**
     *
     * @return {Frame}
     */
    get currentFrame() {
        return this._apng.frames[this._currentFrameNumber];
    }

    renderNextFrame() {
        this._currentFrameNumber = (this._currentFrameNumber + 1) % this._apng.frames.length;
        if (this._currentFrameNumber === this._apng.frames.length - 1) {
            this._numPlays++;
            if (this._apng.numPlays !== 0 && this._numPlays >= this._apng.numPlays) {
                this._ended = true;
                this._paused = true;
            }
        }

        if (this._prevFrame && this._prevFrame.disposeOp == 1) {
            this.context.clearRect(
                this._prevFrame.left,
                this._prevFrame.top,
                this._prevFrame.width,
                this._prevFrame.height,
            );
        } else if (this._prevFrame && this._prevFrame.disposeOp == 2) {
            this.context.putImageData(
                this._prevFrameData!,
                this._prevFrame.left,
                this._prevFrame.top,
            );
        }

        const frame = this.currentFrame;
        this._prevFrame = frame;
        this._prevFrameData = null;
        if (frame.disposeOp == 2) {
            this._prevFrameData = this.context.getImageData(
                frame.left,
                frame.top,
                frame.width,
                frame.height,
            );
        }
        if (frame.blendOp == 0) {
            this.context.clearRect(frame.left, frame.top, frame.width, frame.height);
        }

        this.context.drawImage(frame.imageElement!, frame.left, frame.top);

        this.emit('frame', this._currentFrameNumber);
        if (this._ended) {
            this.emit('end');
        }
    }

    // playback

    get paused() {
        return this._paused;
    }

    get ended() {
        return this._ended;
    }

    play() {
        this.emit('play');

        if (this._ended) {
            this.stop();
        }
        this._paused = false;

        let nextRenderTime = performance.now() + this.currentFrame.delay / this.playbackRate;
        const tick = (now: number) => {
            if (this._ended || this._paused) {
                return;
            }
            if (now >= nextRenderTime) {
                while (now - nextRenderTime >= this._apng.playTime / this.playbackRate) {
                    nextRenderTime += this._apng.playTime / this.playbackRate;
                    this._numPlays++;
                }
                do {
                    this.renderNextFrame();
                    nextRenderTime += this.currentFrame.delay / this.playbackRate;
                } while (!this._ended && now > nextRenderTime);
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    pause() {
        if (!this._paused) {
            this.emit('pause');
            this._paused = true;
        }
    }

    stop() {
        this.emit('stop');
        this._numPlays = 0;
        this._ended = false;
        this._paused = true;
        // render first frame
        this._currentFrameNumber = -1;
        this.context.clearRect(0, 0, this._apng.width, this._apng.height);
        this.renderNextFrame();
    }

    jump(frameNumber: number) {
        this._currentFrameNumber = Math.max(0, frameNumber - 1) % this._apng.frames.length;
        this.renderNextFrame();
    }
}
